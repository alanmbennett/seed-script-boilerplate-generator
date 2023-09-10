import * as azdata from 'azdata';
import { IConnectionProfile, ObjectExplorerContext, ObjectMetadata } from "azdata";

export default class ConnectionContext {
    public currentConnection: azdata.connection.ConnectionProfile;
    public readonly nodeType: string;
    public readonly schema: string;
    public readonly tableName: string;
    public readonly databaseName: string;
    public readonly fullTableName: string;
    public readonly escapedFullTableName: string;
    public readonly objectExplorerConnection: IConnectionProfile;
    public readonly tableMetadata: ObjectMetadata;
    public readonly connectionUri: string;

    constructor(
        context: ObjectExplorerContext,
        currentConnection: azdata.connection.ConnectionProfile,
        objectExplorerConnection: IConnectionProfile,
        connectionUri: string
    ) {
        this.currentConnection = currentConnection;

        const nodeInfo = context.nodeInfo!;

        this.schema = nodeInfo.metadata!.schema!;
        this.tableName = nodeInfo.metadata!.name;

        // TODO: Look into moving this
        this.fullTableName = `${this.schema}.${this.tableName}`;
        this.escapedFullTableName = `[${this.schema}].[${this.tableName}]`;

        this.objectExplorerConnection = objectExplorerConnection;
        this.databaseName = this.objectExplorerConnection.databaseName!;

        this.tableMetadata = nodeInfo.metadata!;
        this.nodeType = nodeInfo.nodeType;
        this.connectionUri = connectionUri;
    }

    static async createFromContext(context: ObjectExplorerContext) {
        const objectExplorerConnection = context.connectionProfile!;
        let newConnection = objectExplorerConnection;
        const databaseName = newConnection.databaseName!;
        const databasePropertyName = "database";

        if (newConnection.options[databasePropertyName] !== databaseName) {
            newConnection = Object.assign({}, objectExplorerConnection);
            newConnection.options = Object.assign({}, objectExplorerConnection.options);
            newConnection.options[databasePropertyName] = databaseName;
            newConnection.groupId = undefined;
            newConnection.saveProfile = false;

            const connectionResult = await azdata.connection.connect(newConnection, false, false);
            newConnection.id = connectionResult.connectionId!;
        }

        const connectionUri = await azdata.connection.getUriForConnection(newConnection.id);
        const currentConnection = newConnection.id === objectExplorerConnection.id
            ? await azdata.connection.getCurrentConnection()
            : (await azdata.connection.getConnections())
                .find(connection => connection.connectionId === newConnection.id)!;

        return new ConnectionContext(
            context,
            currentConnection,
            objectExplorerConnection,
            connectionUri
        );
    }
}
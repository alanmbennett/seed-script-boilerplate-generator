import * as azdata from 'azdata';
import { IConnectionProfile, ObjectExplorerContext, ObjectMetadata } from "azdata";

export default class ConnectionContext {
    public readonly nodeType: string;
    public readonly schema: string;
    public readonly tableName: string;
    public readonly databaseName: string;
    public readonly fullTableName: string;
    public readonly escapedFullTableName: string;
    public readonly objectExplorerConnectionProfile: IConnectionProfile;
    public readonly connectionProfile: IConnectionProfile;
    public readonly tableMetadata: ObjectMetadata;
    public readonly connectionUri: string;

    constructor(
        context: ObjectExplorerContext,
        objectExplorerConnectionProfile: IConnectionProfile,
        connectionProfile: IConnectionProfile,
        connectionUri: string
    ) {
        const nodeInfo = context.nodeInfo!;

        this.schema = nodeInfo.metadata!.schema!;
        this.tableName = nodeInfo.metadata!.name;
        this.fullTableName = `${this.schema}.${this.tableName}`;
        this.escapedFullTableName = `[${this.schema}].[${this.tableName}]`;
        this.objectExplorerConnectionProfile = objectExplorerConnectionProfile;
        this.connectionProfile = connectionProfile;
        this.databaseName = this.objectExplorerConnectionProfile.databaseName!;
        this.tableMetadata = nodeInfo.metadata!;
        this.nodeType = nodeInfo.nodeType;
        this.connectionUri = connectionUri;
    }

    async getConnectionProfile(): Promise<azdata.connection.ConnectionProfile> {
        return this.connectionProfile.id === this.objectExplorerConnectionProfile.id
            ? await azdata.connection.getCurrentConnection()
            : (await azdata.connection.getConnections())
                .find(connection => connection.connectionId === this.connectionProfile.id)!;
    }

    static async createFromContext(context: ObjectExplorerContext) {
        const originalConnectionProfile = context.connectionProfile!;
        let connectionProfile = originalConnectionProfile;
        const databaseName = connectionProfile.databaseName!;
        const databasePropertyName = "database";

        if (connectionProfile.options[databasePropertyName] !== databaseName) {
            connectionProfile = Object.assign({}, originalConnectionProfile);
            connectionProfile.options = Object.assign({}, originalConnectionProfile.options);
            connectionProfile.options[databasePropertyName] = databaseName;
            connectionProfile.groupId = undefined;
            connectionProfile.saveProfile = false;

            const connectionResult = await azdata.connection.connect(connectionProfile, false, false);
            connectionProfile.id = connectionResult.connectionId!;
        }

        const connectionUri = await azdata.connection.getUriForConnection(connectionProfile.id);
        return new ConnectionContext(context, originalConnectionProfile, connectionProfile, connectionUri);
    }
}
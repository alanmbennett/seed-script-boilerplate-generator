import { IConnectionProfile, ObjectExplorerContext, ObjectMetadata } from "azdata";

export default class ConnectionContext {
    public readonly nodeType: string;
    public readonly schema: string;
    public readonly tableName: string;
    public readonly databaseName: string;
    public readonly fullTableName: string;
    public readonly escapedFullTableName: string;
    public readonly connectionProfile: IConnectionProfile;
    public readonly tableMetadata: ObjectMetadata;
    public readonly connectionUri: string;

    constructor(context: ObjectExplorerContext, connectionUri: string) {
        const nodeInfo = context.nodeInfo!;

        this.connectionUri = connectionUri;
        this.schema = nodeInfo.metadata!.schema!;
        this.tableName = nodeInfo.metadata!.name;
        this.fullTableName = `${this.schema}.${this.tableName}`;
        this.escapedFullTableName = `[${this.schema}].[${this.tableName}]`;
        this.connectionProfile = context.connectionProfile!;
        this.databaseName = this.connectionProfile.databaseName!;
        this.tableMetadata = nodeInfo.metadata!;
        this.nodeType = nodeInfo.nodeType;
    }
}
import * as azdata from 'azdata';
import ConnectionContext from '../connectionContext';

export abstract class ColumnFetcher {
    protected readonly context : ConnectionContext;

    constructor(context : ConnectionContext) {
        this.context = context;
    }

    public abstract getColumns(): Promise<Column[]>;

    protected async getColumnMetadata(): Promise<azdata.ColumnMetadata[]> {
        const metadataProvider = azdata.dataprotocol.getProvider<azdata.MetadataProvider>(this.context.currentConnection.providerId, azdata.DataProviderType.MetadataProvider);
        return await metadataProvider.getTableInfo(this.context.connectionUri, this.context.tableMetadata);
    }

    protected async getObjectExplorerNodes() : Promise<azdata.objectexplorer.ObjectExplorerNode[]> {
        const nodes = await azdata.objectexplorer.findNodes(
            this.context.objectExplorerConnection.id, 
            this.context.nodeType,
            this.context.schema,
            this.context.tableName,
            this.context.databaseName,
            []
        );

        const folderNodes = await nodes[0].getChildren();
        return await folderNodes.filter(node => node.label === 'Columns')[0].getChildren();
    }
}

export type Column = {
    dataType?: string,
    name: string,
    escapedName: string,
    objectExplorerLabel: string
    isIdentity: boolean
};
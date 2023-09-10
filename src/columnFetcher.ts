import * as azdata from 'azdata';
import ConnectionContext from './connectionContext';

export class ColumnFetcher {
    private readonly context : ConnectionContext;

    constructor(context : ConnectionContext) {
        this.context = context;
    }

    public async getColumns() : Promise<Column[]> {
        const metadataPromise = this.getColumnMetadata();
        const columnNodesPromise = this.getColumnNodes();
        const columnMetadata = await metadataPromise;
        const columnNodes = await columnNodesPromise;

        return columnMetadata
            .filter(
                metadata => !metadata.isCalculated 
                    && !metadata.isComputed
            )
            .sort((first, second) =>
            {
                if (first.ordinal === second.ordinal) {
                    return 0;
                } else if (first.ordinal > second.ordinal) {
                    return 1;
                } else {
                    return -1;
                }
            })
            .map(metadata => {
                const assoicatedNode = columnNodes.find(
                    node => node.metadata!.name === metadata.escapedName.replace('[', '').replace(']', '')
                )!;

                return {
                    nodeInfo: assoicatedNode,
                    metadata: metadata,
                    unsanitizedAttributes: assoicatedNode.label.replace(assoicatedNode.metadata!.name, '')
                        .trimStart()
                };
            })
            .filter(column => !column.unsanitizedAttributes.includes('Computed'));
    }

    private async getColumnMetadata(): Promise<azdata.ColumnMetadata[]> {
        const metadataProvider = azdata.dataprotocol.getProvider<azdata.MetadataProvider>(this.context.currentConnection.providerId, azdata.DataProviderType.MetadataProvider);
        return await metadataProvider.getTableInfo(this.context.connectionUri, this.context.tableMetadata);
    }

    private async getColumnNodes() : Promise<azdata.objectexplorer.ObjectExplorerNode[]> {
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
    nodeInfo: azdata.objectexplorer.ObjectExplorerNode,
    metadata: azdata.ColumnMetadata,
    unsanitizedAttributes: string
};
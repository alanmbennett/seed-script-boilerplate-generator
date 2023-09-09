import * as azdata from 'azdata';

export class ColumnFetcher {
    private readonly context : azdata.ObjectExplorerContext;
    private readonly connectionUri: string;

    constructor(context : azdata.ObjectExplorerContext, connectionUri: string) {
        this.context = context;
        this.connectionUri = connectionUri;
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

    private async getColumnMetadata() : Promise<azdata.ColumnMetadata[]> {
        const metadataProvider = azdata.dataprotocol.getProvidersByType<azdata.MetadataProvider>(azdata.DataProviderType.MetadataProvider)[0];
        return await metadataProvider.getTableInfo(this.connectionUri, this.context.nodeInfo!.metadata!);
    }

    private async getColumnNodes() : Promise<azdata.objectexplorer.ObjectExplorerNode[]> {
        const nodes = await azdata.objectexplorer.findNodes(
            this.context.connectionProfile!.id, 
            this.context.nodeInfo!.nodeType,
            this.context.nodeInfo!.metadata!.schema!,
            this.context.nodeInfo!.metadata!.name,
            String(this.context.connectionProfile!.databaseName),
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
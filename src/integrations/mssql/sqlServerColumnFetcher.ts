import { Column, ColumnFetcher } from "../columnFetcher";
import ConnectionContext from "../../connectionContext";

export default class SqlServerColumnFetcher extends ColumnFetcher {
    constructor(connectionContext: ConnectionContext) {
        super(connectionContext);
    }

    public async getColumns() : Promise<Column[]> {
        const metadataPromise = this.getColumnMetadata();
        const columnNodesPromise = this.getObjectExplorerNodes();
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
                    name: assoicatedNode.metadata!.name,
                    escapedName: metadata.escapedName,
                    objectExplorerLabel: assoicatedNode.label.replace(assoicatedNode.metadata!.name, '')
                        .trimStart(),
                    isIdentity: metadata.isIdentity
                };
            })
            .filter(column => !column.objectExplorerLabel.includes('Computed'));
    }
}
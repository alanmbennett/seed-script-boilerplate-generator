import { ColumnFetcher } from "./columnFetcher";
import { Generator } from "./generator";

export default interface ProviderStrategy {
    get displayTableName(): string;
    get columnFetcher(): ColumnFetcher;
    get generator(): Generator;
}
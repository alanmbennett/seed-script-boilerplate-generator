import { Configuration } from "../../configuration";
import ConnectionContext from "../../connectionContext";
import { ColumnFetcher } from "../columnFetcher";
import { Generator } from "../generator";
import ProviderStrategy from "../providerStrategy";
import SqlServerColumnFetcher from "./sqlServerColumnFetcher";
import SqlServerGenerator from "./sqlServerGenerator";

export default class SqlServerProviderStrategy implements ProviderStrategy {
    private readonly connectionContext: ConnectionContext;
    private readonly configuration: Configuration;

    constructor(connectionContext: ConnectionContext, configuration: Configuration) {
        this.connectionContext = connectionContext;
        this.configuration = configuration;
    }

    get displayTableName() {
        return `${this.connectionContext.schema}.${this.connectionContext.tableName}`;
    }

    get columnFetcher(): ColumnFetcher {
        return new SqlServerColumnFetcher(this.connectionContext);
    }

    get generator(): Generator {
        return new SqlServerGenerator(this.connectionContext, this.configuration);
    }
}
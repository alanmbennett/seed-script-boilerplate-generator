import { Configuration } from "../configuration";
import ConnectionContext from "../connectionContext";
import SqlServerProviderStrategy from "./mssql/sqlServerProviderStrategy";
import ProviderStrategy from "./providerStrategy";

export default class ProviderStrategyFactory {
    static create(connectionContext: ConnectionContext, configuration: Configuration): ProviderStrategy {
        const providerID = connectionContext.currentConnection.providerId;
        switch (providerID.toLowerCase()) {
            case "mssql":
                return new SqlServerProviderStrategy(connectionContext, configuration);
            default:
                throw new Error(`Provider ID '${providerID}' not supported.`);
        }
    }
}
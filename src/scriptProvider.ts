import * as azdata from 'azdata';
import ConnectionContext from './connectionContext';

export default class ScriptProvider {
    public static async generateCreateScript(context: ConnectionContext) {
        const scriptProvider = azdata.dataprotocol.getProvider<azdata.ScriptingProvider>(
            context.currentConnection.providerId,
            azdata.DataProviderType.ScriptingProvider
        );

        return await scriptProvider.scriptAsOperation(
            context.connectionUri, 
            azdata.ScriptOperation.Create, 
            context.tableMetadata,
            {
                scriptCompatibilityOption: '',
                targetDatabaseEngineEdition: '',
                targetDatabaseEngineType: ''
            }
        );
    }
}
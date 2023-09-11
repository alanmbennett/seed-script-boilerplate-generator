import * as azdata from 'azdata';
import { Column } from './columnFetcher';
import { Configuration } from '../configuration';
import ConnectionContext from '../connectionContext';

export abstract class Generator {
    protected readonly context : ConnectionContext;
    protected readonly configuration: Configuration;

    protected readonly indent;
    protected readonly newline = '\n';

    constructor(
        context : ConnectionContext, 
        configuration: Configuration
    ) {
        this.context = context;
        this.configuration = configuration;
        this.indent = this.configuration.indent;
    }

    public async generateScripts(columns: Column[]) : Promise<GeneratedScripts> {
        const seedScriptHelperBuilder: string[] = [];
        const insertQueryBuilder: string[] = [];

        this.beforeColumnInserts(seedScriptHelperBuilder, insertQueryBuilder);

        const lastIndex = columns.length - 1;
        columns.forEach((column, index) => {
            this.onColumnInsert(seedScriptHelperBuilder, insertQueryBuilder, column, index === lastIndex);
        });

        await this.afterColumnInserts(seedScriptHelperBuilder, insertQueryBuilder);

        return {
            seedScriptHelperSql: seedScriptHelperBuilder.join(this.newline),
            insertQuerySql: insertQueryBuilder.join(this.newline),
        };
    }

    protected abstract beforeColumnInserts(seedScriptHelperBuilder: string[], insertQueryBuilder: string[]): void;

    protected abstract onColumnInsert(seedScriptHelperBuilder: string[], insertQueryBuilder: string[], column: Column, isLastColumn: boolean): void;

    protected abstract afterColumnInserts(seedScriptHelperBuilder: string[], insertQueryBuilder: string[]): Promise<void>;

    protected async generateCreateScript() {
        const scriptProvider = azdata.dataprotocol.getProvider<azdata.ScriptingProvider>(
            this.context.currentConnection.providerId,
            azdata.DataProviderType.ScriptingProvider
        );

        return await scriptProvider.scriptAsOperation(
            this.context.connectionUri, 
            azdata.ScriptOperation.Create, 
            this.context.tableMetadata,
            {
                scriptCompatibilityOption: '',
                targetDatabaseEngineEdition: '',
                targetDatabaseEngineType: ''
            }
        );
    }
}

export type GeneratedScripts = {
    seedScriptHelperSql: string,
    insertQuerySql: string
};
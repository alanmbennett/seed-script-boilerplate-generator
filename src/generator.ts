import * as azdata from 'azdata';
import { Column } from './columnFetcher';
import { Configuration } from './configuration';
import ConnectionContext from './connectionContext';

export class Generator {
    private readonly context : ConnectionContext;
    private readonly configuration: Configuration;
    private readonly columns: Column[];

    private readonly indent;
    private readonly newline = '\n';

    private static readonly numericTypes = [
        'int',
        'bit',
        'decimal',
        'numeric',
        'float',
        'real',
        'money',
        'geography',
        'geometry'
    ];

    private static readonly scriptCompatibilityOptionMap = new Map<number, string>([
        [90, 'Script90Compat'],
        [100, 'Script100Compat'],
        [105, 'Script105Compat'],
        [110, 'Script110Compat'],
        [120, 'Script120Compat'],
        [130, 'Script130Compat'],
        [140, 'Script140Compat']
    ]);

    private static readonly targetDatabaseEngineEditionMap = new Map<number, string>([
        [0, 'SqlServerEnterpriseEdition'],
        [1, 'SqlServerPersonalEdition'],
        [2, 'SqlServerStandardEdition'],
        [3, 'SqlServerEnterpriseEdition'],
        [4, 'SqlServerExpressEdition'],
        [5, 'SqlAzureDatabaseEdition'],
        [6, 'SqlDatawarehouseEdition'],
        [7, 'SqlServerStretchEdition'],
        [11, 'SqlServerOnDemandEdition'],
    ]);

    constructor(
        context : ConnectionContext, 
        configuration: Configuration,
        columns : Column[]
    ) {
        this.context = context;
        this.columns = columns;
        this.configuration = configuration;
        this.indent = this.configuration.indent;
    }

    public async generateScripts() : Promise<GeneratedScripts> {
        const seedScriptHelperBuilder = [
            'SELECT TOP 1000 REPLACE(',
            `${this.indent}'('`
        ];

        let insertQueryBuilder = [
            `INSERT INTO ${this.context.escapedFullTableName}`,
            '('
        ];

        let needsIdentityInsert = false;
        const lastIndex = this.columns.length - 1;
        
        this.columns.forEach((column, index) => {
            if(!needsIdentityInsert && column.metadata.isIdentity) {
                needsIdentityInsert = true;
            }

            const isLastColumn = index === lastIndex;

            insertQueryBuilder.push(`${this.indent}${column.metadata.escapedName}${isLastColumn ? '' : ','}`);
            seedScriptHelperBuilder.push(`${this.indent}+ ${this.buildColumnLine(column, isLastColumn)}`);
        });

        insertQueryBuilder.push(
            ')',
            'VALUES',
            '/* Paste output from SELECT query here */'
        );

        if(needsIdentityInsert || await this.isIdentityByScanningCreateTableScript()) {
            const identityInsert = `SET IDENTITY_INSERT ${this.context.escapedFullTableName}`;
            insertQueryBuilder.push('', `${identityInsert} OFF;`);

            insertQueryBuilder = [`${identityInsert} ON;`, ''].concat(insertQueryBuilder);
        }

        seedScriptHelperBuilder.push(
            `${this.indent}+ '), '`,
            ", '''NULL'''",
            ", 'NULL')",
            `FROM ${this.context.escapedFullTableName};`
        );

        return {
            seedScriptHelperSql: seedScriptHelperBuilder.join(this.newline),
            insertQuerySql: insertQueryBuilder.join(this.newline),
        };
    }

    private includesDataType(attributes: string, dataTypes: string[]) {
        for (const dataType of dataTypes) {
            if (attributes.includes(dataType)) {
                return true;
            }
        }

        return false;
    }

    private buildColumnLine(column : Column, isLastColumn : boolean) : string {
        const columnLabel = this.configuration.enableColumnLabels
            ? `'/* ${column.metadata.escapedName} */ ' + `
            : '';
        
        let isNullArguments = '';
        
        if (this.includesDataType(column.unsanitizedAttributes, Generator.numericTypes)) {
            isNullArguments = `CONVERT(VARCHAR, ${column.metadata.escapedName}), 'NULL'`;
        } else if (this.includesDataType(column.unsanitizedAttributes, ["date", "time"])) {
            isNullArguments = `'''' + CONVERT(VARCHAR, ${column.metadata.escapedName}) + '''', 'NULL'`;
        } else if (this.includesDataType(column.unsanitizedAttributes, ["text"])) {
            isNullArguments = `'''' + REPLACE(CONVERT(VARCHAR(MAX), ${column.metadata.escapedName}), '''', '''''') + '''', 'NULL'`;
        } else {
            isNullArguments = `'''' + CONVERT(VARCHAR(MAX), REPLACE(${column.metadata.escapedName}, '''', '''''')) + '''', 'NULL'`;
        }  

        return `${columnLabel}ISNULL(${isNullArguments})${isLastColumn ? '' : " + ', '"}`;
    }

    private async isIdentityByScanningCreateTableScript() {
        const scriptProvider = azdata.dataprotocol.getProvidersByType<azdata.ScriptingProvider>(azdata.DataProviderType.ScriptingProvider)[0];
        const serverInfo = await azdata.connection.getServerInfo(this.context.connectionProfile.id);

        const scriptResult = await scriptProvider.scriptAsOperation(
            this.context.connectionUri, 
            azdata.ScriptOperation.Create, 
            this.context.tableMetadata,
            {
                scriptCompatibilityOption: Generator.scriptCompatibilityOptionMap.get(serverInfo.serverMajorVersion!)!,
                targetDatabaseEngineEdition: Generator.targetDatabaseEngineEditionMap.get(serverInfo.engineEditionId!)!,
                targetDatabaseEngineType: serverInfo.isCloud ? 'SqlAzure' : 'SingleInstance'
            }
        );

        const identityRegex = /IDENTITY(\(\d,\s?\d+\))?/g;
        return identityRegex.test(scriptResult.script);
    }
}

export type GeneratedScripts = {
    seedScriptHelperSql: string,
    insertQuerySql: string
};
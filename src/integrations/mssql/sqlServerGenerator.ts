import { Configuration } from "../../configuration";
import ConnectionContext from "../../connectionContext";
import { Generator } from "../generator";
import { Column } from "../columnFetcher";
import ScriptProvider from "../../scriptProvider";

export default class SqlServerGenerator extends Generator {
    private needsIdentityInsert = false;

    private escapedTableName: string;

    constructor(
        context : ConnectionContext, 
        configuration: Configuration,
    ) {
        super(context, configuration);
        this.escapedTableName = `[${this.context.schema}].[${this.context.tableName}]`;
    }

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

    protected beforeColumnInserts(seedScriptHelperBuilder: string[], insertQueryBuilder: string[]): void {
        seedScriptHelperBuilder.push(
            'SELECT TOP 1000 REPLACE(',
            `${this.indent}'('`
        );

        insertQueryBuilder.push(
            `INSERT INTO ${this.escapedTableName}`,
            '('
        );
    }

    protected onColumnInsert(
        seedScriptHelperBuilder: string[],
        insertQueryBuilder: string[],
        column: Column,
        isLastColumn: boolean
    ): void {
        if (this.includesDataType(column.objectExplorerLabel, ['timestamp', 'rowversion'])) {
            return;
        }

        if(!this.needsIdentityInsert && column.isIdentity) {
            this.needsIdentityInsert = true;
        }

        insertQueryBuilder.push(`${this.indent}${column.escapedName}${isLastColumn ? '' : ','}`);
        seedScriptHelperBuilder.push(`${this.indent}+ ${this.buildColumnLine(column, isLastColumn)}`);
    }

    protected async afterColumnInserts(seedScriptHelperBuilder: string[], insertQueryBuilder: string[]): Promise<void> {
        insertQueryBuilder.push(
            ')',
            'VALUES',
            '/* Paste output from SELECT query here */'
        );

        if(this.needsIdentityInsert || await this.isIdentityByScanningCreateTableScript()) {
            const identityInsert = `SET IDENTITY_INSERT ${this.escapedTableName}`;
            insertQueryBuilder.unshift(`${identityInsert} ON;`, '');
            insertQueryBuilder.push('', `${identityInsert} OFF;`);
        }

        seedScriptHelperBuilder.push(
            `${this.indent}+ '), '`,
            ", '''NULL'''",
            ", 'NULL')",
            `FROM ${this.escapedTableName};`
        );
    }

    private buildColumnLine(column: Column, isLastColumn: boolean): string {
        const columnLabel = this.configuration.enableColumnLabels
            ? `'/* ${column.escapedName} */ ' + `
            : '';
        
        let firstIsNullArgument = '';
        
        if (this.includesDataType(column.objectExplorerLabel, SqlServerGenerator.numericTypes)) {
            firstIsNullArgument = `CONVERT(VARCHAR(MAX), ${column.escapedName})`;
        } else if (this.includesDataType(column.objectExplorerLabel, ['date', 'time'])) {
            firstIsNullArgument = `'''' + CONVERT(VARCHAR(MAX), ${column.escapedName}) + ''''`;
        } else if (this.includesDataType(column.objectExplorerLabel, ['text'])) {
            firstIsNullArgument = `'''' + REPLACE(CONVERT(VARCHAR(MAX), ${column.escapedName}), '''', '''''') + ''''`;
        } else if (this.includesDataType(column.objectExplorerLabel, ['binary'])) {
            firstIsNullArgument = `CONVERT(VARCHAR(MAX), ${column.escapedName}, 1)`;
        } else if (this.includesDataType(column.objectExplorerLabel, ['image'])) {
            firstIsNullArgument = `CAST(CAST(${column.escapedName} AS VARBINARY(MAX)) AS VARCHAR(MAX))`;
        } else if (this.includesDataType(column.objectExplorerLabel, ['hierarchyid'])) {
            firstIsNullArgument = `'CAST(''' + CONVERT(VARCHAR(MAX), ${column.escapedName}) + ''' AS HIERARCHYID)'`;
        } else {
            firstIsNullArgument = `'''' + CONVERT(VARCHAR(MAX), REPLACE(${column.escapedName}, '''', '''''')) + ''''`;
        }  

        return `${columnLabel}ISNULL(${firstIsNullArgument}, 'NULL')${isLastColumn ? '' : " + ', '"}`;
    }

    private includesDataType(attributes: string, dataTypes: string[]) {
        for (const dataType of dataTypes) {
            if (attributes.includes(dataType)) {
                return true;
            }
        }

        return false;
    }

    private async isIdentityByScanningCreateTableScript() {
        const scriptResult = await ScriptProvider.generateCreateScript(this.context);
        const identityRegex = /IDENTITY(\(\d,\s?\d+\))?/g;
        return identityRegex.test(scriptResult.script);
    }
}
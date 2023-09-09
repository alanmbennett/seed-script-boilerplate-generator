'use strict';
import * as vscode from 'vscode';
import * as azdata from 'azdata';
import { ColumnFetcher } from './columnFetcher';
import { Generator } from './generator';
import { QueryDocumentStrategy } from './queryDocumentStrategy';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(
        'seed-script-boilerplate-generator.generate', 
        async (objectExplorerContext: azdata.ObjectExplorerContext) => {
            try{
                const tableName = `${objectExplorerContext.nodeInfo!.metadata!.schema!}.${objectExplorerContext.nodeInfo!.metadata!.name}`;
                vscode.window.showInformationMessage(`Generating seed script boilerplate for ${tableName}...`);

                const connectionUri = await azdata.connection.getUriForConnection(objectExplorerContext.connectionProfile!.id)
    
                const columns = await (new ColumnFetcher(objectExplorerContext, connectionUri)).getColumns();
                if(columns.length === 0)
                {
                    vscode.window.showErrorMessage(`No valid columns found for ${tableName}.`);
                    return;
                }
    
                const generator = new Generator(objectExplorerContext, connectionUri, columns);
                const scripts = await generator.generateScripts();

                const currentConnection = await azdata.connection.getCurrentConnection();
                await new QueryDocumentStrategy(scripts, currentConnection).openDocument();
    
                vscode.window.showInformationMessage(`Successfully generated seed script boilerplate for ${tableName}!`);
            }
            catch (error)
            {
                vscode.window.showErrorMessage(`Failed to generate seed script boilerplate: ${error}`);
            }
        }
    ));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
'use strict';
import * as vscode from 'vscode';
import * as azdata from 'azdata';
import { ColumnFetcher } from './columnFetcher';
import { Generator } from './generator';
import { QueryDocumentStrategy } from './queryDocumentStrategy';
import { Configuration } from './configuration';
import ConnectionContext from './connectionContext';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(
        'seed-script-boilerplate-generator.generate', 
        async (objectExplorerContext: azdata.ObjectExplorerContext) => {
            try {
                vscode.window.showInformationMessage(`Generating seed script boilerplate...`);

                const connectionUri = await azdata.connection.getUriForConnection(objectExplorerContext.connectionProfile!.id);
                const connectionContext = new ConnectionContext(objectExplorerContext, connectionUri);
    
                const columns = await (new ColumnFetcher(connectionContext)).getColumns();
                if(columns.length === 0) {
                    vscode.window.showErrorMessage(`No valid columns found for ${connectionContext.fullTableName}.`);
                    return;
                }
    
                const configuration = new Configuration();
                const generator = new Generator(connectionContext, configuration, columns);
                const scripts = await generator.generateScripts();

                const currentConnection = await azdata.connection.getCurrentConnection();
                await new QueryDocumentStrategy(scripts, currentConnection).openDocument();
    
                vscode.window.showInformationMessage(`Successfully generated seed script boilerplate for ${connectionContext.fullTableName}!`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to generate seed script boilerplate: ${error}`);
            }
        }
    ));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
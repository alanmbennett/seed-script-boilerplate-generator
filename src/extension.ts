'use strict';
import * as vscode from 'vscode';
import * as azdata from 'azdata';
import { QueryDocumentStrategy } from './queryDocumentStrategy';
import { Configuration } from './configuration';
import ConnectionContext from './connectionContext';
import ProviderStrategyFactory from './integrations/providerStrategyFactory';
import ProviderStrategy from './integrations/providerStrategy';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(
        'seed-script-boilerplate-generator.generate', 
        async (objectExplorerContext: azdata.ObjectExplorerContext) => {
            try {
                let connectionContext: ConnectionContext;
                let providerStrategy: ProviderStrategy;
                
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Generating seed script boilerplate...'
                }, async () => {
                    connectionContext = await ConnectionContext.createFromContext(objectExplorerContext);
                    const configuration = new Configuration();
                    providerStrategy = ProviderStrategyFactory.create(connectionContext, configuration);
    
                    const columns = await providerStrategy.columnFetcher.getColumns();
                    if (columns.length === 0) {
                        vscode.window.showErrorMessage(`No valid columns found for ${providerStrategy.displayTableName}.`);
                        return;
                    }
        
                    const scripts = await providerStrategy.generator.generateScripts(columns);
                    await new QueryDocumentStrategy(scripts, connectionContext.currentConnection).openDocument();
                });
    
                vscode.window.showInformationMessage(`Successfully generated seed script boilerplate for ${providerStrategy!.displayTableName}!`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to generate seed script boilerplate: ${error}`);
            }
        }
    ));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
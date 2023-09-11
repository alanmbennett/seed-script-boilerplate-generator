import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { GeneratedScripts } from "./integrations/generator";

export class QueryDocumentStrategy
{
    private readonly scripts : GeneratedScripts;
    private readonly connectionProfile: azdata.connection.ConnectionProfile;

    constructor(scripts : GeneratedScripts, connectionProfile : azdata.connection.ConnectionProfile) {
        this.scripts = scripts;
        this.connectionProfile = connectionProfile;
    }

    public async openDocument() {
        await azdata.queryeditor.openQueryDocument(
            { content: this.scripts.seedScriptHelperSql },
            this.connectionProfile.providerId
        )
            .then(document => {
                document.connect(this.connectionProfile);
            });
        
        const insertDocument = await vscode.workspace.openTextDocument({ language: 'sql', content: this.scripts.insertQuerySql });
        await vscode.window.showTextDocument(insertDocument, vscode.ViewColumn.Beside, true);
    }
}
import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { GeneratedScripts } from "./generator";

export class QueryDocumentStrategy
{
    private scripts : GeneratedScripts;
    private connectionProfile : azdata.connection.ConnectionProfile;
    private providerID = 'MSSQL';

    constructor(scripts : GeneratedScripts, connectionProfile : azdata.connection.ConnectionProfile) {
        this.scripts = scripts;
        this.connectionProfile = connectionProfile;
    }

    public async openDocument() {
        await azdata.queryeditor.openQueryDocument(
            { content: this.scripts.seedScriptHelperSql },
            this.providerID
        )
            .then(document => {
                document.connect(this.connectionProfile);
            });
        
        const insertDocument = await vscode.workspace.openTextDocument({ language: 'sql', content: this.scripts.insertQuerySql });
        await vscode.window.showTextDocument(insertDocument, vscode.ViewColumn.Beside, true);
    }
}
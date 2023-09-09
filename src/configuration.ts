import * as vscode from 'vscode';

export class Configuration
{
    public readonly enableColumnLabels;

    public readonly indent;

    constructor() {
        const configuration = vscode.workspace.getConfiguration('seed-script-boilerplate-generator');
        this.enableColumnLabels = configuration.get<boolean>("enableColumnLabels");

        this.indent = configuration.get<boolean>("useTabs")
            ? '\t'
            : ' '.repeat(configuration.get<number>("indentSpaces")!);
    }
}
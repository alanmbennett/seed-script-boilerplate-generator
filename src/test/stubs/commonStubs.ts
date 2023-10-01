import { MetadataType } from "azdata";
import { Configuration } from "../../configuration";
import ConnectionContext from "../../connectionContext";
import * as sinon from 'sinon';
import ScriptProvider from "../../scriptProvider";

export function getConfiguration(): Configuration {
    return {
        enableColumnLabels: true,
        indent: '    '
    };
}

export function getConnectionContext(): ConnectionContext {
    return {
        currentConnection: {
            providerId: '',
            connectionId: '',
            connectionName: '',
            serverName: '',
            databaseName: '',
            userName: '',
            password: '',
            authenticationType: '',
            savePassword: false,
            groupFullName: '',
            groupId: '',
            saveProfile: false,
            options: {}
        },
        nodeType: '',
        schema: '',
        tableName: '',
        databaseName: '',
        objectExplorerConnection: {
            serverName: '',
            userName: '',
            password: '',
            authenticationType: '',
            savePassword: false,
            providerName: '',
            saveProfile: false,
            id: '',
            options: {}
        },
        tableMetadata: {
            metadataType: MetadataType.Table,
            metadataTypeName: '',
            urn: '',
            name: '',
            schema: ''
        },
        connectionUri: ''
    };
}

export function setScriptProviderStub(returnedScript: string = '') {
    sinon.stub(ScriptProvider, 'generateCreateScript').callsFake(
        () => Promise.resolve({
            operationId: '',
            script: returnedScript
        })
    );
}
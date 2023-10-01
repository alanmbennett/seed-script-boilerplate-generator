import { Column } from '../../integrations/columnFetcher';
import SqlServerGenerator from '../../integrations/mssql/sqlServerGenerator';
import theoryTest from '../helpers/theoryTestHelper';
import { getConfiguration, getConnectionContext, setScriptProviderStub } from '../stubs/commonStubs';
import * as chai from 'chai';

const expect = chai.expect;

async function runGenerateScripts(column: Column) {
	const configuration = getConfiguration();
	const connectionContext = getConnectionContext();
	
	const systemUnderTest = new SqlServerGenerator(
		connectionContext,
		configuration
	);

	return await systemUnderTest.generateScripts([column]);
}

suite('MSSQL Seed Script Helper Query - Data Type Tests', () => {
	setScriptProviderStub();

	theoryTest(
		[
			'tinyint',
			'smallint',
			'int',
			'bigint',
			'bit',
			'decimal',
			'numeric',
			'float',
			'real',
			'smallmoney',
			'money',
			'geography',
			'geometry'
		],
		parameter => `${parameter.toUpperCase()} data type will use numeric script`,
		parameter => {
			return () => {
				const column: Column = {
					dataType: parameter,
					name: 'testColumn',
					escapedName: '[testColumn]',
					objectExplorerLabel: `(${parameter}, not null)`,
					isIdentity: false
				};
		
				const expectedLine = `CONVERT(VARCHAR(MAX), ${column.escapedName})`;
		
				return runGenerateScripts(column)
					.then(result => {
						expect(result.seedScriptHelperSql).to.contain(expectedLine);
					});
			};
		}
	);

	theoryTest(
		[
			'date',
			'datetimeoffset',
			'datetime2',
			'smalldatetime',
			'datetime',
			'time'
		],
		parameter => `${parameter.toUpperCase()} data type will use date script`,
		parameter => {
			return () => {
				const column: Column = {
					dataType: parameter,
					name: 'testColumn',
					escapedName: '[testColumn]',
					objectExplorerLabel: `(${parameter}, not null)`,
					isIdentity: false
				};
		
				const expectedLine = `'''' + CONVERT(VARCHAR(MAX), ${column.escapedName}) + ''''`;
		
				return runGenerateScripts(column)
					.then(result => {
						expect(result.seedScriptHelperSql).to.contain(expectedLine);
					});
			};
		}
	);

	theoryTest(
		[
			'text',
			'ntext'
		],
		parameter => `${parameter.toUpperCase()} data type will use text script`,
		parameter => {
			return () => {
				const column: Column = {
					dataType: parameter,
					name: 'testColumn',
					escapedName: '[testColumn]',
					objectExplorerLabel: `(${parameter}, not null)`,
					isIdentity: false
				};
		
				const expectedLine = `'''' + REPLACE(CONVERT(VARCHAR(MAX), ${column.escapedName}), '''', '''''') + ''''`;
		
				return runGenerateScripts(column)
					.then(result => {
						expect(result.seedScriptHelperSql).to.contain(expectedLine);
					});
			};
		}
	);

	theoryTest(
		[
			'binary',
			'varbinary'
		],
		parameter => `${parameter.toUpperCase()} data type will use binary script`,
		parameter => {
			return () => {
				const column: Column = {
					dataType: parameter,
					name: 'testColumn',
					escapedName: '[testColumn]',
					objectExplorerLabel: `(${parameter}, not null)`,
					isIdentity: false
				};
		
				const expectedLine = `CONVERT(VARCHAR(MAX), ${column.escapedName}, 1)`;
		
				return runGenerateScripts(column)
					.then(result => {
						expect(result.seedScriptHelperSql).to.contain(expectedLine);
					});
			};
		}
	);

	test('IMAGE script will be specially handled', () => {
		const column: Column = {
			dataType: 'image',
			name: 'testColumn',
			escapedName: '[testColumn]',
			objectExplorerLabel: '(image, not null)',
			isIdentity: false
		};

		const expectedLine = `CAST(CAST(${column.escapedName} AS VARBINARY(MAX)) AS VARCHAR(MAX))`;

		return runGenerateScripts(column)
			.then(result => {
				expect(result.seedScriptHelperSql).to.contain(expectedLine);
			});
	});

	test('HIERARCHYID script will be specially handled', () => {
		const column: Column = {
			dataType: 'hierarchyid',
			name: 'testColumn',
			escapedName: '[testColumn]',
			objectExplorerLabel: '(hierarchyid, not null)',
			isIdentity: false
		};

		const expectedLine = `'CAST(''' + CONVERT(VARCHAR(MAX), ${column.escapedName}) + ''' AS HIERARCHYID)'`;

		return runGenerateScripts(column)
			.then(result => {
				expect(result.seedScriptHelperSql).to.contain(expectedLine);
			});
	});

	theoryTest(
		[
			'char',
			'varchar',
			'nchar',
			'nvarchar',
			'uniqueidentifier'
		],
		parameter => `${parameter.toUpperCase()} data type will use default/string script`,
		parameter => {
			return () => {
				const column: Column = {
					dataType: parameter,
					name: 'testColumn',
					escapedName: '[testColumn]',
					objectExplorerLabel: `(${parameter}, not null)`,
					isIdentity: false
				};
		
				const expectedLine = `'''' + CONVERT(VARCHAR(MAX), REPLACE(${column.escapedName}, '''', '''''')) + ''''`;
		
				return runGenerateScripts(column)
					.then(result => {
						expect(result.seedScriptHelperSql).to.contain(expectedLine);
					});
			};
		}
	);

	theoryTest(
		[
			'timestamp',
			'rowversion'
		],
		parameter => `${parameter.toUpperCase()} data type will be excluded from script`,
		parameter => {
			return () => {
				const column: Column = {
					dataType: parameter,
					name: 'testColumn',
					escapedName: '[testColumn]',
					objectExplorerLabel: `(${parameter}, not null)`,
					isIdentity: false
				};
	
				return runGenerateScripts(column)
					.then(result => {
						expect(result.seedScriptHelperSql).to.not.contain(column.escapedName);
					});
			};
		}
	);
});

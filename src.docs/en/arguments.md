# Running Arguments
Parameter | Description | Default Value | Type
------------- | ------------- | ------------- | -------------
PPD_ROOT | Root folder of tests | `process.cwd()` | `String`
PPD_ROOT_ADDITIONAL | Append folders of tests and stuff | `[]` | `String[]`
PPD_ROOT_IGNORE | Ignore folders of tests starts with | `['.git', 'node_modules', '.history']` | `String[]`
PPD_TESTS | Name of tests to run one by one | `[]` | `String[]`
PPD_DATA | Object with data | `{}` | `Object`
PPD_SELECTORS | Object with selectors | `{}` | `Object`
PPD_OUTPUT | Path to log folder | `output` | `String`
PPD_DEBUG_MODE | Debug mode | `false` | `Boolean`
PPD_LOG_DISABLED | Disable logging | `false` | `Boolean`
PPD_LOG_EXTEND | Log every atoms time for tuning and breadcrumbs for test | `false` | `Boolean`
PPD_LOG_LEVEL_NESTED | Log only nested levels of log bellow this. `0` - log all | `0` | `Number`
PPD_LOG_LEVEL_TYPE_IGNORE | Log ignore types. [`raw`, `debug`, `info`, `test`, `warn`, `error`, `env`] | `[]` | `String[]`
PPD_LOG_SCREENSHOT | Screenshot of elements enable | `false` | `Boolean`
PPD_LOG_FULLPAGE | Full screen screenshot enable | `false` | `Boolean`
PPD_LOG_TEST_NAME | Show in log name of test on every line | `true` | `Boolean`
PPD_LOG_IGNORE_HIDE_LOG | Show all log even if it ignore inline | `false` | `Boolean`
PPD_LOG_DOCUMENTATION_MODE | Show documentation in descriptionExtend | `false` | `Boolean`
PPD_LOG_NAMES_ONLY | Show only names in list/ All by default | `[]` | `String[]`
PPD_LOG_TIMER_SHOW | Show timer in log | `false` | `Boolean`
PPD_LOG_TIMESTAMP_SHOW | Show timer in log | `false` | `Boolean`
PPD_LOG_INDENT_LENGTH | Indents in log | `4` | `Number`
PPD_CONTINUE_ON_ERROR_ENABLED | continueOnError flag | `false` | `Boolean`

Arguments applying order. From minor to major:
1. Defaults
1. CLI arguments
1. ENV variables
1. Arguments from script
const { t } = require('./lib')
const input = require('./modules/input')
const list = require('./modules/list')

describe('One simple test', () => {
  t`
  ${{ input, list }}
  it writes a simple test
  - visit /
  - run input.add first
  - run list.contains first
  - input test into $todo-input
  - click $add-todo
  `
})

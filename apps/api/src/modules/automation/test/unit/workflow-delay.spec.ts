import { parseWorkflowDelay } from '../../domain/services/workflow-delay'

describe('parseWorkflowDelay', () => {
  it.each([
    ['10m', 600_000],
    ['24h', 86_400_000],
    ['30d', 2_592_000_000],
    ['1500ms', 1_500],
    ['1s', 1_000],
    ['2H', 7_200_000],
  ])('parses %s into milliseconds', (value, expected) => {
    expect(parseWorkflowDelay(value)).toBe(expected)
  })

  it.each(['', '0m', '01h', '1.5h', '-1d', '1w', '10', '999999999999999d'])(
    'rejects invalid or unsafe delay %s',
    (value) => {
      expect(() => parseWorkflowDelay(value)).toThrow()
    },
  )
})

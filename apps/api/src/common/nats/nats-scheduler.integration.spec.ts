import { connect, headers, StringCodec } from 'nats'

const hasNats = Boolean(process.env.NATS_URL)

describe('NATS JetStream scheduled messages', () => {
  (hasNats ? it : it.skip)(
    'delivers an @at message to its target subject without a blocking timer',
    async () => {
      const connection = await connect({ servers: process.env.NATS_URL! })
      const js = connection.jetstream()
      const jsm = await connection.jetstreamManager()
      const codec = StringCodec()
      const suffix = Date.now().toString()
      const stream = `WF_SCHED_TEST_${suffix}`
      const scheduleSubject = `test.workflow.schedule.${suffix}`
      const targetSubject = `test.workflow.resume.${suffix}`
      const durable = `wf-sched-test-${suffix}`
      let subscription: any = null

      try {
        await jsm.streams.add({
          name: stream,
          subjects: [scheduleSubject, targetSubject],
          storage: 'file',
          retention: 'limits',
          allow_msg_schedules: true,
        } as any)

        const payload = { executionId: 'integration-test', scheduled: true }
        const messageHeaders = headers()
        messageHeaders.set('Nats-Schedule', `@at ${new Date(Date.now() + 1_500).toISOString()}`)
        messageHeaders.set('Nats-Schedule-Target', targetSubject)

        await js.publish(
          scheduleSubject,
          codec.encode(JSON.stringify(payload)),
          { msgID: `schedule-${suffix}`, headers: messageHeaders },
        )

        subscription = await js.pullSubscribe(targetSubject, durable)
        const batch = await subscription.fetch(1, { maxWait: 10_000 })
        let received: string | null = null

        for await (const message of batch) {
          received = codec.decode(message.data)
          message.ack()
        }

        expect(received).toBe(JSON.stringify(payload))
      } finally {
        subscription?.unsubscribe()
        try {
          await jsm.streams.delete(stream)
        } finally {
          await connection.close()
        }
      }
    },
    20_000,
  )
})

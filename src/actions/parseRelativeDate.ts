import { Action, z } from "@botpress/runtime"

type Output = {
  isoDate: string
  humanReadable: string
}

const parseRelativeDate = new Action({
  name: "parseRelativeDate",
  description:
    "Convert a relative date expression (like 'next Friday' or 'end of Q1') to an actual date",

  input: z.object({
    relativeDateExpression: z
      .string()
      .describe("The relative date expression to parse, e.g., 'next Friday', 'in 2 weeks', 'end of Q1'"),
  }),

  output: z.object({
    isoDate: z.string().describe("The parsed date in ISO format (YYYY-MM-DD), or empty if no deadline"),
    humanReadable: z.string().describe("Human-readable date format"),
  }),

  async handler({ input }): Promise<Output> {
    const today = new Date()
    const expression = input.relativeDateExpression.toLowerCase().trim()

    let targetDate: Date | null = null

    // Handle "no deadline" / "none" / "n/a"
    if (
      expression === "no deadline" ||
      expression === "none" ||
      expression === "n/a" ||
      expression === "-"
    ) {
      return {
        isoDate: "",
        humanReadable: "No deadline",
      }
    }

    // Handle "next [day]"
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const nextDayMatch = expression.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i)
    if (nextDayMatch) {
      const targetDay = dayNames.indexOf(nextDayMatch[1].toLowerCase())
      const currentDay = today.getDay()
      let daysUntil = targetDay - currentDay
      if (daysUntil <= 0) daysUntil += 7
      targetDate = new Date(today)
      targetDate.setDate(today.getDate() + daysUntil)
    }

    // Handle "in X days/weeks/months"
    const inXMatch = expression.match(/in\s+(\d+)\s+(day|days|week|weeks|month|months)/i)
    if (inXMatch) {
      const amount = parseInt(inXMatch[1], 10)
      const unit = inXMatch[2].toLowerCase()
      targetDate = new Date(today)
      if (unit.startsWith("day")) {
        targetDate.setDate(today.getDate() + amount)
      } else if (unit.startsWith("week")) {
        targetDate.setDate(today.getDate() + amount * 7)
      } else if (unit.startsWith("month")) {
        targetDate.setMonth(today.getMonth() + amount)
      }
    }

    // Handle "end of Q1/Q2/Q3/Q4"
    const quarterMatch = expression.match(/end\s+of\s+q([1-4])/i)
    if (quarterMatch) {
      const quarter = parseInt(quarterMatch[1], 10)
      const year = today.getFullYear()
      const quarterEndMonths = [2, 5, 8, 11] // March, June, September, December (0-indexed)
      const endMonth = quarterEndMonths[quarter - 1]
      targetDate = new Date(year, endMonth + 1, 0) // Last day of the quarter end month
    }

    // Handle "end of [month]"
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ]
    const endOfMonthMatch = expression.match(
      /end\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i
    )
    if (endOfMonthMatch) {
      const monthIndex = monthNames.indexOf(endOfMonthMatch[1].toLowerCase())
      let year = today.getFullYear()
      if (monthIndex < today.getMonth()) {
        year += 1 // If the month has passed, use next year
      }
      targetDate = new Date(year, monthIndex + 1, 0) // Last day of that month
    }

    // Handle "tomorrow"
    if (expression === "tomorrow") {
      targetDate = new Date(today)
      targetDate.setDate(today.getDate() + 1)
    }

    // Handle "next week" (7 days from now)
    if (expression === "next week") {
      targetDate = new Date(today)
      targetDate.setDate(today.getDate() + 7)
    }

    // Handle "next month"
    if (expression === "next month") {
      targetDate = new Date(today)
      targetDate.setMonth(today.getMonth() + 1)
    }

    // If we couldn't parse, return the original expression
    if (!targetDate) {
      return {
        isoDate: input.relativeDateExpression,
        humanReadable: input.relativeDateExpression,
      }
    }

    const isoDate = targetDate.toISOString().split("T")[0]
    const humanReadable = targetDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return { isoDate, humanReadable }
  },
})

export default parseRelativeDate

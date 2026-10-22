/**
 * Middleware factory for Zod validation on request body, query, or params
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: issues[0]?.message || 'Invalid input data provided.',
          details: issues,
        },
      });
    }

    req[source] = result.data;
    next();
  };
}

import { z } from 'zod'

export const PermissionSchema = z.object({
  _id: z.string(),
  read: z.boolean(),
  write: z.boolean(),
  delete: z.boolean(),
})

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  token: z.string(),
  roles: z.array(z.string()),
  permissions: z.record(PermissionSchema),
  status: z.string(),
})

// Infer types if needed
// export type Permission = z.infer<typeof PermissionSchema>
// export type User = z.infer<typeof UserSchema>

export type Schemas = {
  User: z.infer<typeof UserSchema>
  Permission: z.infer<typeof PermissionSchema>
}

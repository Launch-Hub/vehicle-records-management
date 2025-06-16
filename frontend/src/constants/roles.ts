export const ROLES = [
  {
    name: 'admin',
    permissions: {
      general: {
        read: true,
        write: true,
        delete: true,
      },
      users: {
        read: true,
        write: true,
        delete: true,
      },
      settings: {
        read: true,
        write: true,
        delete: true,
      },
      records: {
        read: true,
        write: true,
        delete: true,
      },
      reports: {
        read: true,
        write: true,
        delete: true,
      },
    },
  },
]

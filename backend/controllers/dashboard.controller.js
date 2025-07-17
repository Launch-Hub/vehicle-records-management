const { VehicleRecord } = require("../models/vehicle_record");
const { User } = require("../models/user");
const { Procedure } = require("../models/procedure");
const { Bulk } = require("../models/bulk");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get total counts
    const totalRecords = await VehicleRecord.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProcedures = await Procedure.countDocuments();
    const totalBulks = await Bulk.countDocuments();

    // Get today's counts
    const todayRecords = await VehicleRecord.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const todayProcedures = await Procedure.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const todayBulks = await Bulk.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Get this week's counts
    const weekRecords = await VehicleRecord.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    const weekProcedures = await Procedure.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Get this month's counts
    const monthRecords = await VehicleRecord.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthProcedures = await Procedure.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get procedures by specific statuses
    const createdPendingProcedures = await Procedure.countDocuments({
      status: "pending"
    });

    // Get processing procedures (all steps)
    const processingProcedures = await Procedure.countDocuments({
      status: "processing"
    });

    // Get processing procedures by step 1-7 as an array
    const steps = await Promise.all(
      Array.from({ length: 7 }, (_, i) =>
        Procedure.countDocuments({ status: "processing", step: i + 1 })
      )
    );
    const stepStats = steps.map((count, idx) => ({ step: idx + 1, count }));

    // Get overdue procedures (pending or processing with dueDate < current date)
    const overdueProcedures = await Procedure.countDocuments({
      $and: [
        { status: { $in: ["pending", "processing"] } },
        { dueDate: { $lt: now } }
      ]
    });

    // Get archived procedures
    const archivedProcedures = await Procedure.countDocuments({
      status: "archived"
    });

    // Get completed and archived procedures
    const completedArchivedProcedures = await Procedure.countDocuments({
      status: { $in: ["completed", "archived"] }
    });

    // Get records by status
    const recordsByStatus = await VehicleRecord.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get procedures by status
    const proceduresByStatus = await Procedure.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recentRecords = await VehicleRecord.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const recentProcedures = await Procedure.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      totals: {
        records: totalRecords,
        users: totalUsers,
        procedures: totalProcedures,
        bulks: totalBulks
      },
      today: {
        records: todayRecords,
        procedures: todayProcedures,
        bulks: todayBulks
      },
      week: {
        records: weekRecords,
        procedures: weekProcedures
      },
      month: {
        records: monthRecords,
        procedures: monthProcedures
      },
      procedureStats: {
        overdue: overdueProcedures,
        processing: processingProcedures,
        steps: stepStats,
        archived: archivedProcedures
      },
      byStatus: {
        records: recordsByStatus,
        procedures: proceduresByStatus
      },
      trends: {
        records: recentRecords,
        procedures: recentProcedures
      }
    });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}; 
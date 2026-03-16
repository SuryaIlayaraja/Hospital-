const express = require("express");
const router = express.Router();
const { OPDFeedback, IPDFeedback } = require("../models/Feedback");

// Department → feedback field mapping for filtering
// When a department is selected, only records where that field exists & is non-empty are included.
const DEPARTMENT_FIELD_MAP = {
  "Nursing":         "nursingCare",
  "Operations":      "appointmentBooking",
  "House Keeping":   "hospitalCleanliness",
  "Maintenance":     "hospitalCleanliness",
  "Medical":         "counsellingSession",
  "F&B":             null, // no direct field
  "Security":        null,
  "Transport":       null,
  "IT":              null,
  "Laundry":         null,
  "Billing":         "billingProcess",
  "Insurance / TPA": "billingProcess",
  "MRD":             "registrationProcess",
  "Lab":             "labStaffSkilled",
  "Radiology":       "radiologyStaffSkilled",
  "Blood Bank":      "labStaffSkilled",
  "Pharmacy":        "pharmacyWaitingTime",
};

// Build an extra $match stage for department filtering
const buildDeptMatch = (department) => {
  if (!department || department === "all") return null;
  const field = DEPARTMENT_FIELD_MAP[department];
  if (!field) return null; // departments without a mapped field → no filter
  return { [field]: { $exists: true, $ne: "" } };
};

// Day-wise analysis for a particular week
// GET /feedback/daywise?start=YYYY-MM-DD&end=YYYY-MM-DD&type=all|opd|ipd&department=<name>
router.get("/daywise", async (req, res) => {
  try {
    const { start, end, type = "all", department } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Start and end dates are required (YYYY-MM-DD)",
        });
    }

    // Parse dates
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // include the whole end day

    // Build department-specific field filter (if any)
    const deptMatch = buildDeptMatch(department);
    const baseMatch = { timestamp: { $gte: startDate, $lte: endDate }, ...(deptMatch || {}) };

    // Helper to aggregate for a model
    const aggregateDaywise = (Model) =>
      Model.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              day: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              overallExperience: "$overallExperience",
            },
            count: { $sum: 1 },
          },
        },
      ]);

    // Determine which models to query based on type.
    // Departments tied to OPD-only fields → skip IPD when filtering.
    const deptField = department ? DEPARTMENT_FIELD_MAP[department] : null;
    const ipdFields = ["registrationProcess", "roomReadiness", "roomCleanliness",
      "doctorExplanation", "nurseCommunication", "planExplanation",
      "promptnessAttending", "pharmacyTimeliness", "billingCourtesy",
      "operationsHospitality", "dischargeProcess"];
    const opdOnlyField = deptField && !ipdFields.includes(deptField);
    const ipdOnlyField = deptField && ipdFields.includes(deptField);

    let all = [];
    if (type === "opd" || (type === "all" && opdOnlyField)) {
      all = await aggregateDaywise(OPDFeedback);
    } else if (type === "ipd" || (type === "all" && ipdOnlyField)) {
      all = await aggregateDaywise(IPDFeedback);
    } else {
      // Default: combine both OPD and IPD
      const [opd, ipd] = await Promise.all([
        aggregateDaywise(OPDFeedback),
        aggregateDaywise(IPDFeedback),
      ]);
      all = [...opd, ...ipd];
    }
    // Map: { day: { Will Recommend: n, May Recommend: n, Will Not Recommend: n, total: n } }
    const dayMap = {};
    all.forEach(({ _id, count }) => {
      const day = _id.day;
      const cat =
        _id.overallExperience === "Excellent"
          ? "Will Recommend"
          : _id.overallExperience === "Good"
          ? "May Recommend"
          : "Will Not Recommend"; // Fair (Average) and Poor
      if (!dayMap[day])
        dayMap[day] = {
          "Will Recommend": 0,
          "May Recommend": 0,
          "Will Not Recommend": 0,
          total: 0,
        };
      dayMap[day][cat] += count;
      dayMap[day].total += count;
    });

    // Format for frontend: [{ day, willRecommend, mayRecommend, willNotRecommend }]
    const result = Object.entries(dayMap)
      .map(([day, v]) => ({
        day,
        willRecommend: v["Will Recommend"]
          ? ((v["Will Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        mayRecommend: v["May Recommend"]
          ? ((v["May Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        willNotRecommend: v["Will Not Recommend"]
          ? ((v["Will Not Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        total: v.total,
      }))
      .sort((a, b) => new Date(a.day) - new Date(b.day));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in daywise feedback analysis:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error in daywise feedback analysis",
        error: error.message,
      });
  }
});

// Monthly analysis for a particular year
// GET /feedback/monthly?year=YYYY&type=all|opd|ipd&department=<name>
router.get("/monthly", async (req, res) => {
  try {
    const { year = new Date().getFullYear(), type = "all", department } = req.query;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const deptMatch = buildDeptMatch(department);
    const baseMatch = { timestamp: { $gte: startDate, $lte: endDate }, ...(deptMatch || {}) };

    const aggregateMonthly = (Model) =>
      Model.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              month: {
                $dateToString: { format: "%Y-%m", date: "$timestamp" },
              },
              overallExperience: "$overallExperience",
            },
            count: { $sum: 1 },
          },
        },
      ]);

    const deptField = department ? DEPARTMENT_FIELD_MAP[department] : null;
    const ipdFields = ["registrationProcess", "roomReadiness", "roomCleanliness",
      "doctorExplanation", "nurseCommunication", "planExplanation",
      "promptnessAttending", "pharmacyTimeliness", "billingCourtesy",
      "operationsHospitality", "dischargeProcess"];
    const opdOnlyField = deptField && !ipdFields.includes(deptField);
    const ipdOnlyField = deptField && ipdFields.includes(deptField);

    let all = [];
    if (type === "opd" || (type === "all" && opdOnlyField)) {
      all = await aggregateMonthly(OPDFeedback);
    } else if (type === "ipd" || (type === "all" && ipdOnlyField)) {
      all = await aggregateMonthly(IPDFeedback);
    } else {
      const [opd, ipd] = await Promise.all([
        aggregateMonthly(OPDFeedback),
        aggregateMonthly(IPDFeedback),
      ]);
      all = [...opd, ...ipd];
    }

    const monthMap = {};
    all.forEach(({ _id, count }) => {
      const month = _id.month;
      const cat =
        _id.overallExperience === "Excellent"
          ? "Will Recommend"
          : _id.overallExperience === "Good"
          ? "May Recommend"
          : "Will Not Recommend";
      if (!monthMap[month])
        monthMap[month] = {
          "Will Recommend": 0,
          "May Recommend": 0,
          "Will Not Recommend": 0,
          total: 0,
        };
      monthMap[month][cat] += count;
      monthMap[month].total += count;
    });

    const result = Object.entries(monthMap)
      .map(([month, v]) => ({
        month,
        willRecommend: v["Will Recommend"]
          ? ((v["Will Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        mayRecommend: v["May Recommend"]
          ? ((v["May Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        willNotRecommend: v["Will Not Recommend"]
          ? ((v["Will Not Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        total: v.total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in monthly feedback analysis:", error);
    res.status(500).json({ success: false, message: "Error in monthly analysis", error: error.message });
  }
});

// Yearly analysis
// GET /feedback/yearly?type=all|opd|ipd&department=<name>
router.get("/yearly", async (req, res) => {
  try {
    const { type = "all", department } = req.query;

    const deptMatch = buildDeptMatch(department);
    const baseMatch = deptMatch ? { ...deptMatch } : {};

    const aggregateYearly = (Model) => {
      const pipeline = [];
      if (Object.keys(baseMatch).length > 0) pipeline.push({ $match: baseMatch });
      pipeline.push({
        $group: {
          _id: {
            year: { $dateToString: { format: "%Y", date: "$timestamp" } },
            overallExperience: "$overallExperience",
          },
          count: { $sum: 1 },
        },
      });
      return Model.aggregate(pipeline);
    };

    const deptField = department ? DEPARTMENT_FIELD_MAP[department] : null;
    const ipdFields = ["registrationProcess", "roomReadiness", "roomCleanliness",
      "doctorExplanation", "nurseCommunication", "planExplanation",
      "promptnessAttending", "pharmacyTimeliness", "billingCourtesy",
      "operationsHospitality", "dischargeProcess"];
    const opdOnlyField = deptField && !ipdFields.includes(deptField);
    const ipdOnlyField = deptField && ipdFields.includes(deptField);

    let all = [];
    if (type === "opd" || (type === "all" && opdOnlyField)) {
      all = await aggregateYearly(OPDFeedback);
    } else if (type === "ipd" || (type === "all" && ipdOnlyField)) {
      all = await aggregateYearly(IPDFeedback);
    } else {
      const [opd, ipd] = await Promise.all([
        aggregateYearly(OPDFeedback),
        aggregateYearly(IPDFeedback),
      ]);
      all = [...opd, ...ipd];
    }

    const yearMap = {};
    all.forEach(({ _id, count }) => {
      const year = _id.year;
      const cat =
        _id.overallExperience === "Excellent"
          ? "Will Recommend"
          : _id.overallExperience === "Good"
          ? "May Recommend"
          : "Will Not Recommend";
      if (!yearMap[year])
        yearMap[year] = {
          "Will Recommend": 0,
          "May Recommend": 0,
          "Will Not Recommend": 0,
          total: 0,
        };
      yearMap[year][cat] += count;
      yearMap[year].total += count;
    });

    const result = Object.entries(yearMap)
      .map(([year, v]) => ({
        year,
        willRecommend: v["Will Recommend"]
          ? ((v["Will Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        mayRecommend: v["May Recommend"]
          ? ((v["May Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        willNotRecommend: v["Will Not Recommend"]
          ? ((v["Will Not Recommend"] / v.total) * 100).toFixed(1)
          : "0.0",
        total: v.total,
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in yearly feedback analysis:", error);
    res.status(500).json({ success: false, message: "Error in yearly analysis", error: error.message });
  }
});

// Submit OPD Feedback
router.post("/opd", async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      type: "OPD",
    };

    const feedback = new OPDFeedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      success: true,
      message: "OPD feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error submitting OPD feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting OPD feedback",
      error: error.message,
    });
  }
});

// Submit IPD Feedback
router.post("/ipd", async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      type: "IPD",
    };

    const feedback = new IPDFeedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      success: true,
      message: "IPD feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error submitting IPD feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting IPD feedback",
      error: error.message,
    });
  }
});

// Get all feedback (for admin panel)
router.get("/all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const [opdFeedback, ipdFeedback] = await Promise.all([
      OPDFeedback.find().sort({ timestamp: -1 }).limit(limit).lean(),
      IPDFeedback.find().sort({ timestamp: -1 }).limit(limit).lean(),
    ]);

    res.json({
      success: true,
      data: {
        opd: opdFeedback,
        ipd: ipdFeedback,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
      error: error.message,
    });
  }
});

// Get OPD feedback only
router.get("/opd", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const feedback = await OPDFeedback.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching OPD feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching OPD feedback",
      error: error.message,
    });
  }
});

// Get IPD feedback only
router.get("/ipd", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const feedback = await IPDFeedback.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching IPD feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching IPD feedback",
      error: error.message,
    });
  }
});

// Get feedback statistics
router.get("/stats", async (req, res) => {
  try {
    const [opdCount, ipdCount] = await Promise.all([
      OPDFeedback.countDocuments(),
      IPDFeedback.countDocuments(),
    ]);

    // Get overall experience distribution
    const [opdExperienceStats, ipdExperienceStats] = await Promise.all([
      OPDFeedback.aggregate([
        {
          $group: {
            _id: "$overallExperience",
            count: { $sum: 1 },
          },
        },
      ]),
      IPDFeedback.aggregate([
        {
          $group: {
            _id: "$overallExperience",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions: opdCount + ipdCount,
        opdCount,
        ipdCount,
        opdExperienceStats,
        ipdExperienceStats,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback statistics",
      error: error.message,
    });
  }
});

module.exports = router;

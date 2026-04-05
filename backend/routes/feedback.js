const express = require("express");
const { getSupabase } = require("../lib/supabase");
const { feedbackRowToClient } = require("../lib/mappers");

const router = express.Router();

const DEPARTMENT_FIELD_MAP = {
  Nursing: "nursingCare",
  Operations: "appointmentBooking",
  "House Keeping": "hospitalCleanliness",
  Maintenance: "hospitalCleanliness",
  Medical: "counsellingSession",
  "F&B": null,
  Security: null,
  Transport: null,
  IT: null,
  Laundry: null,
  Billing: "billingProcess",
  "Insurance / TPA": "billingProcess",
  MRD: "registrationProcess",
  Lab: "labStaffSkilled",
  Radiology: "radiologyStaffSkilled",
  "Blood Bank": "labStaffSkilled",
  Pharmacy: "pharmacyWaitingTime",
};

function buildDeptPredicate(department) {
  if (!department || department === "all") return () => true;
  const field = DEPARTMENT_FIELD_MAP[department];
  if (!field) return () => true;
  return (data) => {
    const v = data?.[field];
    return v != null && String(v).trim() !== "";
  };
}

function aggregateDaywiseLikeMongo(rows) {
  const dayMap = {};
  rows.forEach((row) => {
    const day = new Date(row.timestamp).toISOString().slice(0, 10);
    const exp = row.overall_experience;
    const cat =
      exp === "Excellent"
        ? "Will Recommend"
        : exp === "Good"
          ? "May Recommend"
          : "Will Not Recommend";
    if (!dayMap[day]) {
      dayMap[day] = {
        "Will Recommend": 0,
        "May Recommend": 0,
        "Will Not Recommend": 0,
        total: 0,
      };
    }
    dayMap[day][cat] += 1;
    dayMap[day].total += 1;
  });

  return Object.entries(dayMap)
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
}

function aggregateMonthlyLikeMongo(rows) {
  const monthMap = {};
  rows.forEach((row) => {
    const d = new Date(row.timestamp);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const exp = row.overall_experience;
    const cat =
      exp === "Excellent"
        ? "Will Recommend"
        : exp === "Good"
          ? "May Recommend"
          : "Will Not Recommend";
    if (!monthMap[month]) {
      monthMap[month] = {
        "Will Recommend": 0,
        "May Recommend": 0,
        "Will Not Recommend": 0,
        total: 0,
      };
    }
    monthMap[month][cat] += 1;
    monthMap[month].total += 1;
  });

  return Object.entries(monthMap)
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
}

function aggregateYearlyLikeMongo(rows) {
  const yearMap = {};
  rows.forEach((row) => {
    const year = String(new Date(row.timestamp).getFullYear());
    const exp = row.overall_experience;
    const cat =
      exp === "Excellent"
        ? "Will Recommend"
        : exp === "Good"
          ? "May Recommend"
          : "Will Not Recommend";
    if (!yearMap[year]) {
      yearMap[year] = {
        "Will Recommend": 0,
        "May Recommend": 0,
        "Will Not Recommend": 0,
        total: 0,
      };
    }
    yearMap[year][cat] += 1;
    yearMap[year].total += 1;
  });

  return Object.entries(yearMap)
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
}

const ipdFields = [
  "registrationProcess",
  "roomReadiness",
  "roomCleanliness",
  "doctorExplanation",
  "nurseCommunication",
  "planExplanation",
  "promptnessAttending",
  "pharmacyTimeliness",
  "billingCourtesy",
  "operationsHospitality",
  "dischargeProcess",
];

router.get("/daywise", async (req, res) => {
  try {
    const { start, end, type = "all", department } = req.query;
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required (YYYY-MM-DD)",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const deptPred = buildDeptPredicate(department);
    const deptField = department ? DEPARTMENT_FIELD_MAP[department] : null;
    const opdOnlyField = deptField && !ipdFields.includes(deptField);
    const ipdOnlyField = deptField && ipdFields.includes(deptField);

    const supabase = getSupabase();

    async function loadOpd() {
      const { data, error } = await supabase
        .from("feedback_opd")
        .select("timestamp, overall_experience, data")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());
      if (error) throw error;
      return (data || []).filter((r) => deptPred(r.data || {}));
    }

    async function loadIpd() {
      const { data, error } = await supabase
        .from("feedback_ipd")
        .select("timestamp, overall_experience, data")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());
      if (error) throw error;
      return (data || []).filter((r) => deptPred(r.data || {}));
    }

    let rows = [];
    if (type === "opd" || (type === "all" && opdOnlyField)) {
      rows = await loadOpd();
    } else if (type === "ipd" || (type === "all" && ipdOnlyField)) {
      rows = await loadIpd();
    } else {
      const [opd, ipd] = await Promise.all([loadOpd(), loadIpd()]);
      rows = [...opd, ...ipd];
    }

    const result = aggregateDaywiseLikeMongo(rows);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in daywise feedback analysis:", error);
    res.status(500).json({
      success: false,
      message: "Error in daywise feedback analysis",
      error: error.message,
    });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const { year = new Date().getFullYear(), type = "all", department } = req.query;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const deptPred = buildDeptPredicate(department);
    const deptField = department ? DEPARTMENT_FIELD_MAP[department] : null;
    const opdOnlyField = deptField && !ipdFields.includes(deptField);
    const ipdOnlyField = deptField && ipdFields.includes(deptField);

    const supabase = getSupabase();

    async function loadOpd() {
      const { data, error } = await supabase
        .from("feedback_opd")
        .select("timestamp, overall_experience, data")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());
      if (error) throw error;
      return (data || []).filter((r) => deptPred(r.data || {}));
    }

    async function loadIpd() {
      const { data, error } = await supabase
        .from("feedback_ipd")
        .select("timestamp, overall_experience, data")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());
      if (error) throw error;
      return (data || []).filter((r) => deptPred(r.data || {}));
    }

    let rows = [];
    if (type === "opd" || (type === "all" && opdOnlyField)) {
      rows = await loadOpd();
    } else if (type === "ipd" || (type === "all" && ipdOnlyField)) {
      rows = await loadIpd();
    } else {
      const [opd, ipd] = await Promise.all([loadOpd(), loadIpd()]);
      rows = [...opd, ...ipd];
    }

    const result = aggregateMonthlyLikeMongo(rows);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in monthly feedback analysis:", error);
    res.status(500).json({
      success: false,
      message: "Error in monthly analysis",
      error: error.message,
    });
  }
});

router.get("/yearly", async (req, res) => {
  try {
    const { type = "all", department } = req.query;
    const deptPred = buildDeptPredicate(department);
    const deptField = department ? DEPARTMENT_FIELD_MAP[department] : null;
    const opdOnlyField = deptField && !ipdFields.includes(deptField);
    const ipdOnlyField = deptField && ipdFields.includes(deptField);

    const supabase = getSupabase();

    async function loadOpd() {
      const { data, error } = await supabase.from("feedback_opd").select("timestamp, overall_experience, data");
      if (error) throw error;
      return (data || []).filter((r) => deptPred(r.data || {}));
    }

    async function loadIpd() {
      const { data, error } = await supabase.from("feedback_ipd").select("timestamp, overall_experience, data");
      if (error) throw error;
      return (data || []).filter((r) => deptPred(r.data || {}));
    }

    let rows = [];
    if (type === "opd" || (type === "all" && opdOnlyField)) {
      rows = await loadOpd();
    } else if (type === "ipd" || (type === "all" && ipdOnlyField)) {
      rows = await loadIpd();
    } else {
      const [opd, ipd] = await Promise.all([loadOpd(), loadIpd()]);
      rows = [...opd, ...ipd];
    }

    const result = aggregateYearlyLikeMongo(rows);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in yearly feedback analysis:", error);
    res.status(500).json({
      success: false,
      message: "Error in yearly analysis",
      error: error.message,
    });
  }
});

router.post("/opd", async (req, res) => {
  try {
    const feedbackData = { ...req.body, type: "OPD" };
    const overall = feedbackData.overallExperience || feedbackData.overall_experience;
    const ts = feedbackData.timestamp ? new Date(feedbackData.timestamp) : new Date();

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback_opd")
      .insert({
        data: feedbackData,
        timestamp: ts.toISOString(),
        overall_experience: overall,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "OPD feedback submitted successfully",
      data: feedbackRowToClient(data, "OPD"),
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

router.post("/ipd", async (req, res) => {
  try {
    const feedbackData = { ...req.body, type: "IPD" };
    const overall = feedbackData.overallExperience || feedbackData.overall_experience;
    const ts = feedbackData.timestamp ? new Date(feedbackData.timestamp) : new Date();

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback_ipd")
      .insert({
        data: feedbackData,
        timestamp: ts.toISOString(),
        overall_experience: overall,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "IPD feedback submitted successfully",
      data: feedbackRowToClient(data, "IPD"),
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

router.get("/all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const supabase = getSupabase();

    const { data: opdRows, error: oErr } = await supabase
      .from("feedback_opd")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (oErr) throw oErr;

    const { data: ipdRows, error: iErr } = await supabase
      .from("feedback_ipd")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (iErr) throw iErr;

    res.json({
      success: true,
      data: {
        opd: (opdRows || []).map((r) => feedbackRowToClient(r, "OPD")),
        ipd: (ipdRows || []).map((r) => feedbackRowToClient(r, "IPD")),
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

router.get("/opd", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback_opd")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map((r) => feedbackRowToClient(r, "OPD")),
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

router.get("/ipd", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback_ipd")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map((r) => feedbackRowToClient(r, "IPD")),
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

router.get("/stats", async (req, res) => {
  try {
    const supabase = getSupabase();

    const { count: opdCount } = await supabase
      .from("feedback_opd")
      .select("*", { count: "exact", head: true });

    const { count: ipdCount } = await supabase
      .from("feedback_ipd")
      .select("*", { count: "exact", head: true });

    const { data: opdRows } = await supabase.from("feedback_opd").select("overall_experience");
    const { data: ipdRows } = await supabase.from("feedback_ipd").select("overall_experience");

    const group = (rows) => {
      const m = {};
      (rows || []).forEach((r) => {
        const k = r.overall_experience || "unknown";
        m[k] = (m[k] || 0) + 1;
      });
      return Object.entries(m).map(([k, v]) => ({ _id: k, count: v }));
    };

    res.json({
      success: true,
      data: {
        totalSubmissions: (opdCount || 0) + (ipdCount || 0),
        opdCount: opdCount || 0,
        ipdCount: ipdCount || 0,
        opdExperienceStats: group(opdRows),
        ipdExperienceStats: group(ipdRows),
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

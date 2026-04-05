const express = require("express");
const { getSupabase } = require("../lib/supabase");
const { departmentRowToClient, cooRowToClient } = require("../lib/mappers");

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("serial_number", { ascending: true });
    if (error) throw error;
    res.json({
      success: true,
      data: (data || []).map(departmentRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch departments" });
  }
});

router.get("/coo/info", async (req, res) => {
  try {
    const supabase = getSupabase();
    let { data: coo } = await supabase.from("coo").select("*").limit(1).maybeSingle();

    if (!coo) {
      const { data: inserted, error: insErr } = await supabase
        .from("coo")
        .insert({
          designation: "COO",
          name: "Chief Operating Officer",
          access: "All Departments",
          ward_access: "All Wards",
        })
        .select("*")
        .single();
      if (insErr) throw insErr;
      coo = inserted;
    }

    res.json({ success: true, data: cooRowToClient(coo) });
  } catch (error) {
    console.error("Error fetching COO:", error);
    res.status(500).json({ success: false, message: "Failed to fetch COO information" });
  }
});

router.put("/coo/update", async (req, res) => {
  try {
    const { designation, name, access, wardAccess, email, phone, isActive } = req.body;
    const supabase = getSupabase();

    let { data: coo } = await supabase.from("coo").select("*").limit(1).maybeSingle();

    const row = {
      updated_at: new Date().toISOString(),
      designation: designation || coo?.designation || "COO",
      name: name || coo?.name || "Chief Operating Officer",
      access: access || coo?.access || "All Departments",
      ward_access: wardAccess || coo?.ward_access || "All Wards",
      email: email !== undefined ? email : coo?.email ?? "",
      phone: phone !== undefined ? phone : coo?.phone ?? "",
      is_active: typeof isActive === "boolean" ? isActive : coo?.is_active ?? true,
    };

    if (!coo) {
      const { data, error } = await supabase.from("coo").insert(row).select("*").single();
      if (error) throw error;
      coo = data;
    } else {
      const { data, error } = await supabase
        .from("coo")
        .update(row)
        .eq("id", coo.id)
        .select("*")
        .single();
      if (error) throw error;
      coo = data;
    }

    res.json({
      success: true,
      message: "COO updated successfully",
      data: cooRowToClient(coo),
    });
  } catch (error) {
    console.error("Error updating COO:", error);
    res.status(500).json({ success: false, message: "Failed to update COO" });
  }
});

router.post("/seed", async (req, res) => {
  try {
    const initialDepartments = [
      {
        serial_number: 1,
        department_name: "Nursing",
        first_level: { designation: "Nursing Supervisor", access: "Particular Ward" },
        second_level: {
          designation: "Chief Nursing Officer",
          access: "All Wards of Nursing Department",
        },
      },
      {
        serial_number: 2,
        department_name: "Operations",
        first_level: { designation: "Operations Executive", access: "Particular Ward" },
        second_level: {
          designation: "Head Operations / Manager",
          access: "All Wards of Operations Department",
        },
      },
      {
        serial_number: 3,
        department_name: "House Keeping",
        first_level: { designation: "House Keeping Supervisor", access: "Particular Ward" },
        second_level: {
          designation: "House Keeping Manager",
          access: "All Wards of House Keeping Department",
        },
      },
      {
        serial_number: 4,
        department_name: "Maintenance",
        first_level: { designation: "Maintenance Supervisor", access: "Particular Ward" },
        second_level: {
          designation: "Maintenance Manager",
          access: "All Wards of Maintenance Department",
        },
      },
      {
        serial_number: 5,
        department_name: "Medical",
        first_level: { designation: "Deputy Medical Superintendant", access: "Particular Ward" },
        second_level: {
          designation: "Medical Superintendant",
          access: "All Wards of Medical Department",
        },
      },
      {
        serial_number: 6,
        department_name: "F&B",
        first_level: { designation: "Dietician", access: "Particular Ward" },
        second_level: { designation: "F&B Manager", access: "All Wards of F&B Department" },
      },
      {
        serial_number: 7,
        department_name: "Security",
        first_level: { designation: "Assistant Security Officer", access: "Particular Ward" },
        second_level: {
          designation: "Security Officer",
          access: "All Wards of Security Department",
        },
      },
      {
        serial_number: 8,
        department_name: "Transport",
        first_level: { designation: "Ambulance/Transport Incharge", access: "All Wards" },
        second_level: {
          designation: "Transport Manager",
          access: "All Wards of Transport Department",
        },
      },
      {
        serial_number: 9,
        department_name: "IT",
        first_level: { designation: "IT Executive", access: "All Wards" },
        second_level: { designation: "IT Manager", access: "All Wards" },
      },
      {
        serial_number: 10,
        department_name: "Laundry",
        first_level: { designation: "Laundry Supervisor", access: "All Wards" },
        second_level: { designation: "Laundry Manager", access: "All Wards" },
      },
      {
        serial_number: 11,
        department_name: "Billing",
        first_level: { designation: "Asst Manager Billing", access: "All Wards" },
        second_level: { designation: "Billing Manager", access: "All Wards" },
      },
      {
        serial_number: 12,
        department_name: "Insurance / TPA",
        first_level: { designation: "Asst Manager Insurance", access: "All Wards" },
        second_level: { designation: "Billing Manager", access: "All Wards" },
      },
      {
        serial_number: 13,
        department_name: "MRD",
        first_level: { designation: "Asst Manager Medical Records", access: "All Wards" },
        second_level: { designation: "Manager Medical Records", access: "All Wards" },
      },
      {
        serial_number: 14,
        department_name: "Lab",
        first_level: { designation: "Lab Incharge", access: "All Wards" },
        second_level: { designation: "Head of Lab Services", access: "All Wards" },
      },
      {
        serial_number: 15,
        department_name: "Radiology",
        first_level: { designation: "Radiology In Charge", access: "All Wards" },
        second_level: { designation: "Head of Radiology Services", access: "All Wards" },
      },
      {
        serial_number: 16,
        department_name: "Blood Bank",
        first_level: { designation: "Blood Bank In Charge", access: "All Wards" },
        second_level: { designation: "Head of Blood Bank", access: "All Wards" },
      },
    ];

    const supabase = getSupabase();
    await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("departments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error: insErr } = await supabase.from("departments").insert(
      initialDepartments.map((d) => ({
        serial_number: d.serial_number,
        department_name: d.department_name,
        first_level: d.first_level,
        second_level: d.second_level,
        is_active: true,
      }))
    );
    if (insErr) throw insErr;

    await supabase.from("coo").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("coo").insert({
      designation: "COO",
      name: "Chief Operating Officer",
      access: "All Departments",
      ward_access: "All Wards",
      email: "suryailayarajaprof@gmail.com",
    });

    res.json({
      success: true,
      message: "Departments seeded successfully",
      count: initialDepartments.length,
    });
  } catch (error) {
    console.error("Error seeding departments:", error);
    res.status(500).json({ success: false, message: "Failed to seed departments" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { departmentName, firstLevel, secondLevel } = req.body;

    if (!departmentName || !firstLevel || !secondLevel) {
      return res.status(400).json({
        success: false,
        message: "Department name, first level, and second level are required",
      });
    }
    if (!firstLevel.designation || !firstLevel.access) {
      return res.status(400).json({
        success: false,
        message: "First level designation and access are required",
      });
    }
    if (!secondLevel.designation || !secondLevel.access) {
      return res.status(400).json({
        success: false,
        message: "Second level designation and access are required",
      });
    }

    const supabase = getSupabase();
    const { data: last } = await supabase
      .from("departments")
      .select("serial_number")
      .order("serial_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSerial = last ? last.serial_number + 1 : 1;

    const { data, error } = await supabase
      .from("departments")
      .insert({
        serial_number: nextSerial,
        department_name: departmentName,
        first_level: {
          designation: firstLevel.designation,
          access: firstLevel.access,
          email: firstLevel.email || "",
          phone: firstLevel.phone || "",
        },
        second_level: {
          designation: secondLevel.designation,
          access: secondLevel.access,
          email: secondLevel.email || "",
          phone: secondLevel.phone || "",
        },
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "Department with this name already exists",
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: departmentRowToClient(data),
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ success: false, message: "Failed to create department" });
  }
});

router.get("/:id/hierarchy", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: department, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const { data: coo } = await supabase.from("coo").select("*").limit(1).maybeSingle();

    res.json({
      success: true,
      data: {
        departmentName: department.department_name,
        firstLevel: department.first_level,
        secondLevel: department.second_level,
        nextLevel: coo
          ? cooRowToClient(coo)
          : {
              designation: "COO",
              access: "All Departments",
              wardAccess: "All Wards",
            },
      },
    });
  } catch (error) {
    console.error("Error fetching department hierarchy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department hierarchy",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, data: departmentRowToClient(data) });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ success: false, message: "Failed to fetch department" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { departmentName, firstLevel, secondLevel, isActive } = req.body;
    const supabase = getSupabase();

    const updateData = { updated_at: new Date().toISOString() };
    if (departmentName) updateData.department_name = departmentName;
    if (firstLevel) {
      updateData.first_level = {
        designation: firstLevel.designation,
        access: firstLevel.access,
        email: firstLevel.email || "",
        phone: firstLevel.phone || "",
      };
    }
    if (secondLevel) {
      updateData.second_level = {
        designation: secondLevel.designation,
        access: secondLevel.access,
        email: secondLevel.email || "",
        phone: secondLevel.phone || "",
      };
    }
    if (typeof isActive === "boolean") updateData.is_active = isActive;

    const { data, error } = await supabase
      .from("departments")
      .update(updateData)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "Department with this name already exists",
        });
      }
      throw error;
    }
    if (!data) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({
      success: true,
      message: "Department updated successfully",
      data: departmentRowToClient(data),
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ success: false, message: "Failed to update department" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("departments").delete().eq("id", req.params.id);
    if (error) throw error;

    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ success: false, message: "Failed to delete department" });
  }
});

module.exports = router;

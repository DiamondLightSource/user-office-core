DO
$$
BEGIN
    IF register_patch('0201_AddCallUnitShifts.sql', 'James Pickering', 'Update call to accept shift as allocated time', '2025-10-24') THEN

        ALTER TABLE IF EXISTS call DROP CONSTRAINT call_allocation_time_unit_check;
        ALTER TABLE IF EXISTS call ADD CONSTRAINT call_allocation_time_unit_check CHECK(allocation_time_unit IN ('day', 'hour', 'week', 'shift'));

    END IF;
END;
$$
LANGUAGE plpgsql;
/*
  # Add appointment_date to leads table

  1. Changes
    - Add `appointment_date` column to `leads` table
      - Type: timestamptz (timestamp with timezone)
      - Optional field for storing scheduled appointment dates
      - Used to filter appointments by date in the UI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'appointment_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN appointment_date timestamptz;
  END IF;
END $$;
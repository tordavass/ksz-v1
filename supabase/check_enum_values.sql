-- Check valid values for user_role enum
SELECT unnest(enum_range(NULL::user_role));

#!/usr/bin/env python3
"""
Utility script to align the Supabase/Postgres schema with the application expectations
and seed default demo users.
"""

import os
from datetime import datetime

import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
if not SUPABASE_DB_URL:
    raise RuntimeError("SUPABASE_DB_URL is not set. Please configure it before running this script.")

conn = psycopg2.connect(SUPABASE_DB_URL, cursor_factory=RealDictCursor)
conn.autocommit = True


def ensure_columns():
    user_columns = {
        'allergies': "ALTER TABLE users ADD COLUMN allergies TEXT DEFAULT ''",
        'availability': "ALTER TABLE users ADD COLUMN availability TEXT DEFAULT ''",
    }
    schedule_columns = {
        'start_time': "ALTER TABLE schedules ADD COLUMN start_time TEXT",
        'end_time': "ALTER TABLE schedules ADD COLUMN end_time TEXT",
        'location': "ALTER TABLE schedules ADD COLUMN location TEXT",
        'shift_type': "ALTER TABLE schedules ADD COLUMN shift_type TEXT",
        'staff_notes': "ALTER TABLE schedules ADD COLUMN staff_notes TEXT",
        'priority': "ALTER TABLE schedules ADD COLUMN priority TEXT DEFAULT 'normal'",
    }
    order_columns = {
        'payment_intent_id': "ALTER TABLE orders ADD COLUMN payment_intent_id TEXT",
        'payment_status': "ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'",
        'currency': "ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'usd'",
    }

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'users'
            """
        )
        existing_user_cols = {row['column_name'] for row in cur.fetchall()}

    for column, statement in user_columns.items():
        if column not in existing_user_cols:
            with conn.cursor() as cur:
                cur.execute(statement)
                print(f"Added users.{column}")

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'schedules'
            """
        )
        existing_schedule_cols = {row['column_name'] for row in cur.fetchall()}

    for column, statement in schedule_columns.items():
        if column not in existing_schedule_cols:
            with conn.cursor() as cur:
                cur.execute(statement)
                print(f"Added schedules.{column}")

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'orders'
            """
        )
        existing_order_cols = {row['column_name'] for row in cur.fetchall()}

    for column, statement in order_columns.items():
        if column not in existing_order_cols:
            with conn.cursor() as cur:
                cur.execute(statement)
                print(f"Added orders.{column}")


def seed_user(email, password, role, **extra):
    email = email.lower()
    with conn.cursor() as cur:
        cur.execute("SELECT email FROM users WHERE LOWER(email) = %s", (email,))
        if cur.fetchone():
            print(f"User {email} already exists. Skipping.")
            return
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO users (email, password, first_name, last_name, mobile, address, dob, sex, registration_date, role, allergies, availability)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                email,
                generate_password_hash(password),
                extra.get('first_name', ''),
                extra.get('last_name', ''),
                extra.get('mobile', ''),
                extra.get('address', ''),
                extra.get('dob', ''),
                extra.get('sex', ''),
                datetime.now().isoformat(),
                role,
                extra.get('allergies', ''),
                extra.get('availability', ''),
            ),
        )
    print(f"Seeded {role} user: {email}")


def seed_demo_users():
    seed_user(
        "admin@foodtruck.com",
        "admin123",
        "admin",
        first_name="Admin",
        last_name="User",
        mobile="555-0001",
        address="HQ",
    )
    seed_user(
        "staff1@foodtruck.com",
        "staff123",
        "staff",
        first_name="Sam",
        last_name="SousChef",
        mobile="555-0002",
        address="Warehouse",
        availability="Weekdays 8a-5p",
    )
    seed_user(
        "customer@foodtruck.com",
        "customer123",
        "customer",
        first_name="Casey",
        last_name="Customer",
        mobile="555-0003",
        address="123 Main St",
        allergies="peanuts",
    )


def main():
    ensure_columns()
    seed_demo_users()
    print("Database setup complete.")


if __name__ == "__main__":
    main()


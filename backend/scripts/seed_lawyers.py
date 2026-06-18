#!/usr/bin/env python3
"""
Seed script to populate the lawyers collection with sample data.
"""

import asyncio
import os
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# Add the app directory to the path so we can import from it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.config import get_settings

async def seed_lawyers():
    settings = get_settings()

    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_default_database(default="unbindai")

    # Sample lawyer data
    lawyers = [
    {
        "name": "Ananya Sharma",
        "specializations": ["Employment", "NDA"],
        "bio": "Ananya specializes in employment law with over 10 years of experience helping businesses navigate complex workplace issues. She has a particular focus on contract negotiation and employee relations.",
        "experienceYears": 10,
        "city": "San Francisco, CA",
        "email": "ananya.sharma@example.com",
        "phone": "+1 (415) 555-0123",
        "rating": 4.8,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Aarav Mehta",
        "specializations": ["Real Estate", "Corporate"],
        "bio": "Aarav is a real estate attorney with extensive experience in commercial property transactions. He has helped clients with acquisitions, leasing, and development projects across the western United States.",
        "experienceYears": 8,
        "city": "New York, NY",
        "email": "aarav.mehta@example.com",
        "phone": "+1 (212) 555-0456",
        "rating": 4.9,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Isha Iyer",
        "specializations": ["SaaS", "Technology"],
        "bio": "Isha focuses on technology law, particularly for SaaS companies. She helps startups and established companies with licensing, data privacy, and intellectual property matters.",
        "experienceYears": 6,
        "city": "Austin, TX",
        "email": "isha.iyer@example.com",
        "phone": "+1 (512) 555-0789",
        "rating": 4.7,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Vikram Malhotra",
        "specializations": ["NDA", "Corporate"],
        "bio": "Vikram has extensive experience in corporate law, with a focus on mergers and acquisitions. He has helped numerous companies navigate complex transactions and contract negotiations.",
        "experienceYears": 12,
        "city": "Seattle, WA",
        "email": "vikram.malhotra@example.com",
        "phone": "+1 (206) 555-0321",
        "rating": 4.6,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Kriti Joshi",
        "specializations": ["Employment", "Compliance"],
        "bio": "Kriti specializes in employment law and compliance, helping companies develop policies and procedures that meet regulatory requirements while protecting business interests.",
        "experienceYears": 9,
        "city": "Chicago, IL",
        "email": "kriti.joshi@example.com",
        "phone": "+1 (312) 555-0654",
        "rating": 4.8,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Rohan Verma",
        "specializations": ["Real Estate", "Construction"],
        "bio": "Rohan focuses on real estate and construction law, representing developers, contractors, and property owners in complex transactions and dispute resolution.",
        "experienceYears": 15,
        "city": "Miami, FL",
        "email": "rohan.verma@example.com",
        "phone": "+1 (305) 555-0987",
        "rating": 4.9,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Priya Nair",
        "specializations": ["SaaS", "Intellectual Property"],
        "bio": "Priya helps technology companies protect their intellectual property and navigate licensing agreements. She has particular expertise in software licensing and open source compliance.",
        "experienceYears": 7,
        "city": "Boston, MA",
        "email": "priya.nair@example.com",
        "phone": "+1 (617) 555-0147",
        "rating": 4.7,
        "verified": True,
        "createdAt": datetime.utcnow()
    },
    {
        "name": "Arjun Banerjee",
        "specializations": ["Corporate", "M&A"],
        "bio": "Arjun has over 15 years of experience in corporate law, with a focus on mergers and acquisitions. He has advised on transactions ranging from small acquisitions to billion-dollar public offerings.",
        "experienceYears": 15,
        "city": "Washington, DC",
        "email": "arjun.banerjee@example.com",
        "phone": "+1 (202) 555-0258",
        "rating": 4.8,
        "verified": True,
        "createdAt": datetime.utcnow()
    }
]


    # Clear existing lawyers (optional)
    await db.lawyers.delete_many({})

    # Insert new lawyers
    result = await db.lawyers.insert_many(lawyers)
    print(f"Inserted {len(result.inserted_ids)} lawyers into the database.")

    # Close connection
    client.close()
    print("Database connection closed.")

if __name__ == "__main__":
    asyncio.run(seed_lawyers())
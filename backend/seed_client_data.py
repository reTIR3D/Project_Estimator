"""Seed script to add example client management data."""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.industry import Industry
from app.models.company import Company
from app.models.rate_sheet import RateSheet


async def seed_client_data():
    """Add example companies and rate sheets to existing industries."""

    async with AsyncSessionLocal() as session:
        # Get existing industries
        result = await session.execute(
            select(Industry).where(Industry.name.in_([
                'Oil & Gas',
                'Heavy Construction',
                'Renewables',
                'Manufacturing'
            ]))
        )
        industries = {ind.name: ind for ind in result.scalars().all()}

        if not industries:
            print("No industries found. Please run seed_industries.py first.")
            return

        # Example companies with rate sheets
        example_data = {
            'Oil & Gas': [
                {
                    'name': 'Shell Energy',
                    'code': 'SHELL',
                    'client_type': 'STRATEGIC',
                    'contact_name': 'John Anderson',
                    'contact_email': 'j.anderson@shell.com',
                    'rate_sheets': [
                        {
                            'name': 'Standard Rates 2025',
                            'description': 'Standard billing rates for typical projects',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 175,
                                'Senior Engineer': 150,
                                'Engineer': 125,
                                'Designer': 110,
                                'CAD Technician': 95,
                                'Project Controls': 120,
                            }
                        },
                        {
                            'name': 'Premium Rates',
                            'description': 'Premium rates for urgent or complex work',
                            'is_default': False,
                            'rates': {
                                'Project Manager': 225,
                                'Senior Engineer': 195,
                                'Engineer': 160,
                                'Designer': 145,
                                'CAD Technician': 125,
                                'Project Controls': 155,
                            }
                        }
                    ]
                },
                {
                    'name': 'ExxonMobil',
                    'code': 'EXXON',
                    'client_type': 'PREFERRED',
                    'contact_name': 'Sarah Mitchell',
                    'contact_email': 's.mitchell@exxonmobil.com',
                    'rate_sheets': [
                        {
                            'name': 'Standard Rates',
                            'description': 'Negotiated rates per MSA',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 165,
                                'Senior Engineer': 145,
                                'Engineer': 120,
                                'Designer': 105,
                                'CAD Technician': 90,
                                'QA/QC Specialist': 125,
                            }
                        }
                    ]
                },
                {
                    'name': 'ConocoPhillips',
                    'code': 'CONOCO',
                    'client_type': 'STANDARD',
                    'contact_name': 'Michael Chen',
                    'contact_email': 'm.chen@conocophillips.com',
                    'rate_sheets': [
                        {
                            'name': ' 2025 Rate Schedule',
                            'description': 'Current year standard rates',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 170,
                                'Senior Engineer': 140,
                                'Engineer': 115,
                                'Designer': 100,
                            }
                        }
                    ]
                }
            ],
            'Heavy Construction': [
                {
                    'name': 'Bechtel Corporation',
                    'code': 'BECHTEL',
                    'client_type': 'STRATEGIC',
                    'contact_name': 'David Thompson',
                    'contact_email': 'd.thompson@bechtel.com',
                    'rate_sheets': [
                        {
                            'name': 'Master Service Agreement Rates',
                            'description': 'Negotiated MSA rates',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 180,
                                'Structural Engineer': 155,
                                'Civil Engineer': 145,
                                'Mechanical Engineer': 150,
                                'Electrical Engineer': 150,
                                'Designer': 115,
                                'CAD Technician': 95,
                            }
                        }
                    ]
                },
                {
                    'name': 'Fluor Corporation',
                    'code': 'FLUOR',
                    'client_type': 'PREFERRED',
                    'contact_name': 'Emily Rodriguez',
                    'contact_email': 'e.rodriguez@fluor.com',
                    'rate_sheets': [
                        {
                            'name': 'Standard Billing Rates',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 175,
                                'Senior Engineer': 145,
                                'Engineer': 120,
                                'Designer': 105,
                                'Surveyor': 110,
                            }
                        },
                        {
                            'name': 'Fast-Track Rates',
                            'description': 'Expedited project rates',
                            'is_default': False,
                            'rates': {
                                'Project Manager': 210,
                                'Senior Engineer': 175,
                                'Engineer': 145,
                                'Designer': 130,
                                'Surveyor': 135,
                            }
                        }
                    ]
                }
            ],
            'Renewables': [
                {
                    'name': 'NextEra Energy',
                    'code': 'NEXTERA',
                    'client_type': 'STRATEGIC',
                    'contact_name': 'Jennifer Park',
                    'contact_email': 'j.park@nexteraenergy.com',
                    'rate_sheets': [
                        {
                            'name': 'Wind & Solar Standard Rates',
                            'description': 'Renewable energy project rates',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 160,
                                'Electrical Engineer': 140,
                                'Mechanical Engineer': 135,
                                'Civil Engineer': 130,
                                'Environmental Specialist': 125,
                                'Designer': 100,
                            }
                        }
                    ]
                },
                {
                    'name': 'Orsted',
                    'code': 'ORSTED',
                    'client_type': 'PREFERRED',
                    'contact_name': 'Lars Nielsen',
                    'contact_email': 'l.nielsen@orsted.com',
                    'rate_sheets': [
                        {
                            'name': 'Offshore Wind Rates',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 185,
                                'Senior Engineer': 165,
                                'Engineer': 140,
                                'Marine Specialist': 155,
                                'Designer': 110,
                            }
                        }
                    ]
                }
            ],
            'Manufacturing': [
                {
                    'name': 'General Electric',
                    'code': 'GE',
                    'client_type': 'STRATEGIC',
                    'contact_name': 'Robert Williams',
                    'contact_email': 'r.williams@ge.com',
                    'rate_sheets': [
                        {
                            'name': 'Industrial Engineering Rates',
                            'is_default': True,
                            'rates': {
                                'Project Manager': 170,
                                'Manufacturing Engineer': 145,
                                'Process Engineer': 140,
                                'Quality Engineer': 135,
                                'Designer': 105,
                                'Automation Engineer': 150,
                            }
                        }
                    ]
                }
            ]
        }

        companies_created = 0
        rate_sheets_created = 0

        # Create companies and rate sheets
        for industry_name, companies_data in example_data.items():
            industry = industries.get(industry_name)
            if not industry:
                continue

            for company_data in companies_data:
                # Check if company already exists
                result = await session.execute(
                    select(Company).where(Company.code == company_data['code'])
                )
                existing = result.scalar_one_or_none()

                if existing:
                    print(f"Company {company_data['name']} already exists, skipping...")
                    continue

                # Create company
                company = Company(
                    industry_id=industry.id,
                    name=company_data['name'],
                    code=company_data['code'],
                    client_type=company_data['client_type'],
                    contact_name=company_data.get('contact_name'),
                    contact_email=company_data.get('contact_email'),
                )
                session.add(company)
                await session.flush()  # Get company ID
                companies_created += 1

                # Create rate sheets
                for rs_data in company_data['rate_sheets']:
                    rate_sheet = RateSheet(
                        company_id=company.id,
                        name=rs_data['name'],
                        description=rs_data.get('description'),
                        rates=rs_data['rates'],
                        is_default=rs_data.get('is_default', False),
                    )
                    session.add(rate_sheet)
                    rate_sheets_created += 1

        await session.commit()

        print(f"\nSuccessfully created {companies_created} companies")
        print(f"Successfully created {rate_sheets_created} rate sheets")
        print("\nExample client data has been seeded!")


if __name__ == '__main__':
    asyncio.run(seed_client_data())

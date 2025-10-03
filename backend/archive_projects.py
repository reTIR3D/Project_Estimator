#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.project import Project

def archive_projects():
    db = Session(bind=engine)
    try:
        projects = db.query(Project).all()
        print('Current projects:')
        for p in projects:
            print(f'  - {p.name} (ID: {p.id}, Status: {p.status})')

        # Archive all except Refinery Modernization Program
        archived_count = 0
        for p in projects:
            if 'refinery' not in p.name.lower() or 'modernization' not in p.name.lower():
                if 'refinery' in p.name.lower() and 'modernization' in p.name.lower():
                    # Keep this one
                    print(f'Keeping: {p.name}')
                    continue
                p.status = 'CANCELLED'
                archived_count += 1
                print(f'Archiving: {p.name}')

        db.commit()
        print(f'\nArchived {archived_count} projects')

        print('\nRemaining active projects:')
        active = db.query(Project).filter(Project.status != 'CANCELLED').all()
        for p in active:
            print(f'  - {p.name} (Status: {p.status})')
    finally:
        db.close()

if __name__ == '__main__':
    archive_projects()

import os
import imaplib
import email
from email.header import decode_header
import datetime
import re

# Read .env file manually to avoid external dependencies
env_vars = {}
try:
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                parts = line.strip().split('=', 1)
                if len(parts) == 2:
                    k, v = parts
                    env_vars[k.strip()] = v.strip().strip('"').strip("'")
except Exception as e:
    print(f"Error reading .env: {e}")

gmail_user = env_vars.get('GMAIL_USER')
gmail_pass = env_vars.get('GMAIL_PASS')

if not gmail_user or not gmail_pass:
    print("[ERROR] GMAIL_USER or GMAIL_PASS not found in .env")
    exit(1)

# Clean app password (remove spaces)
gmail_pass = gmail_pass.replace(' ', '')

print(f"Connecting to Gmail IMAP for {gmail_user}...")
try:
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(gmail_user, gmail_pass)
    mail.select('inbox')
    
    # Search for messages from mailer-daemon
    status, messages = mail.search(None, '(FROM "mailer-daemon")')
    
    if status != 'OK':
        print("[ERROR] Failed to search inbox")
        exit(1)
        
    mail_ids = messages[0].split()
    print(f"Found {len(mail_ids)} total mailer-daemon messages.")
    
    bounces = []
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for mail_id in reversed(mail_ids):
        # Fetch the email headers and body
        status, data = mail.fetch(mail_id, '(RFC822)')
        if status != 'OK':
            continue
            
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)
        
        # Parse Date
        date_str = msg['Date']
        try:
            email_date = email.utils.parsedate_to_datetime(date_str)
        except Exception:
            continue
            
        # Filter for last 2 hours
        time_diff = now - email_date
        if time_diff.total_seconds() > 7200:  # 2 hours
            # Since mails are retrieved in order, we can break once we reach older messages
            break
            
        # Parse Subject
        subject_parts = decode_header(msg['Subject'])
        subject = ""
        for part, encoding in subject_parts:
            if isinstance(part, bytes):
                subject += part.decode(encoding or 'utf-8', errors='ignore')
            else:
                subject += str(part)
                
        # Extract bounce recipient and reason from email body
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    try:
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    except Exception:
                        pass
                    break
        else:
            try:
                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
            except Exception:
                pass
            
        failed_address = "Unknown"
        reason = "Address not found / Delivery failed"
        
        # Parse recipient
        addr_match = re.search(r'to the following recipient failed permanently:\s*([\w\.\-\+\_]+@[\w\.\-\+\_]+)', body, re.IGNORECASE)
        if addr_match:
            failed_address = addr_match.group(1)
        else:
            addr_match2 = re.search(r'failed to deliver to\s*([\w\.\-\+\_]+@[\w\.\-\+\_]+)', body, re.IGNORECASE)
            if addr_match2:
                failed_address = addr_match2.group(1)
            else:
                to_match = re.search(r'To:\s*([\w\.\-\+\_]+@[\w\.\-\+\_]+)', body, re.IGNORECASE)
                if to_match:
                    failed_address = to_match.group(1)
                    
        # Parse reason
        smtp_match = re.search(r'The response from the remote server was:\s*(.*)', body, re.IGNORECASE)
        if smtp_match:
            reason = smtp_match.group(1).strip()
        else:
            smtp_match2 = re.search(r'Diagnostic-Code:\s*(.*)', body, re.IGNORECASE)
            if smtp_match2:
                reason = smtp_match2.group(1).strip()
                
        bounces.append({
            'date': email_date.strftime('%Y-%m-%d %H:%M:%S UTC'),
            'subject': subject,
            'failed_address': failed_address,
            'reason': reason
        })
        
    print("\n=== RECENT EMAIL BOUNCES (Last 2 Hours) ===")
    print("-" * 60)
    if not bounces:
        print("[SUCCESS] No bounces detected in the last 2 hours!")
    else:
        for idx, b in enumerate(bounces, 1):
            print(f"{idx}. Date: {b['date']}")
            print(f"   Recipient: {b['failed_address']}")
            print(f"   Reason: {b['reason']}")
            print("-" * 60)
            
    mail.logout()
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")

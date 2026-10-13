"""
Builds public/cv/Rien-Miro-Gappi-CV.pdf.

Single-column, ATS-friendly, and deliberately **one page**. Plain text, real
fonts, selectable — no images, so applicant tracking systems can parse it.

One page is a hard constraint, not an aspiration. Everything here earns its
line: skills sit high because that is what gets scanned first, every role and
project is one line, and the certificates are folded into two runs rather than
seven stanzas. If you add something, cut something.

After editing, re-run it. The script prints the page count and fails loudly if
the content has spilled onto a second page.

    python scripts/build_cv.py
"""

import os
import sys
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Flowable, KeepTogether,
    Table, TableStyle,
)

# ----------------------------------------------------------------- data

NAME = "RIEN MIRO M. GAPPI"

CONTACT = [
    "Bulacan, Philippines",
    '<a href="mailto:gappirien@gmail.com">gappirien@gmail.com</a>',
    '<a href="https://www.linkedin.com/in/rien-miro-gappi-82bb95389/">linkedin.com/in/rien-miro-gappi</a>',
    '<a href="https://github.com/BugSlayerRien">github.com/BugSlayerRien</a>',
    '<a href="https://rien-portfolio-ten.vercel.app">rien-portfolio-ten.vercel.app</a>',
]

SUMMARY = (
    "Fourth-year BS Information Technology student who is dependable, detail-oriented and quick to "
    "learn. A friendly, approachable teammate who coordinates well with others and turns ideas into "
    "complete, working products."
)

# (school, location, degree, dates, [bullets])
EDUCATION = [
    (
        "National University &ndash; Baliwag",
        "Baliwag, Bulacan",
        "Bachelor of Science in Information Technology",
        "Expected 2027",
        [
            "Dean&rsquo;s Lister",
            "Capstone Project: Brilyantis, AI-powered barbershop platform",
        ],
    ),
    (
        "STI College Baliuag",
        "Baliuag, Bulacan",
        "Senior High School; Graduated With High Honors",
        "2021 &ndash; 2023",
        [],
    ),
]

# Skills sit high: it is the section that gets scanned, and keyword-matched.
SKILLS = [
    ("Languages", "Python, Dart, PHP, SQL, JavaScript, HTML/CSS"),
    ("AI &amp; Integrations", "Google Gemini API, Grok, Cursor, Claude Code, MediaPipe, OpenCV, PayMongo (GCash), "
                              "Firebase Cloud Messaging, Google OAuth, Google Calendar API"),
    ("Frameworks", "React, Vite, React Router, Flutter, Riverpod, FastAPI"),
    ("Data &amp; Infra", "PostgreSQL, Supabase, MySQL, Docker, GitHub Actions, Vercel, Render"),
    ("Tools", "Git, GitHub, Figma, REST API design, Playwright"),
]

# (name, stack, dates, [bullets])
PROJECTS = [
    (
        "Brilyantis (Capstone)",
        "Flutter, PHP, PostgreSQL, Python, FastAPI, MediaPipe, Gemini API",
        "Jan 2026 &ndash; Present",
        [
            "Built a Flutter customer and barber app, a self-service kiosk, and a web portal for receptionists "
            "and admins on a PHP REST API with PostgreSQL row-level security",
            "Developed an AI face scan: a Python FastAPI service uses MediaPipe and OpenCV to read face shape, "
            "then Gemini ranks the top three hairstyles with try-on previews",
            "Designed a booking engine with time-slot locking against double bookings, group bookings and "
            "PayMongo/GCash payments; deployed with Docker on Vercel and Render",
        ],
    ),
    (
        "GoCollab",
        "Flutter, Riverpod, Supabase, Firebase Cloud Messaging, Google Calendar API",
        "Jul 2026 &ndash; Present",
        [
            "Built a role-aware app for GDG on Campus Philippines members and officers using Clean Architecture "
            "on Supabase (Auth, Storage, Realtime)",
            "Implemented event registration with QR tickets and officer QR check-in, Google Calendar sync, push "
            "notifications and a career opportunities hub",
            "Built officer analytics dashboards and partner management for sponsorships, meetings and "
            "communication logs",
        ],
    ),
    (
        "AskNU",
        "Flutter, Dart, Firebase, Cloud Firestore, Cloud Messaging, Gemini API",
        "Aug 2026 &ndash; Present",
        [
            "Built a Flutter student help app for NU Baliwag: FAQ search, bookmarks, offices, document requests "
            "and notifications",
            "Integrated a Gemini assistant that answers from FAQ and handbook content; built an admin dashboard "
            "with analytics",
        ],
    ),
]

# (project, stack, one line)
OTHER_PROJECTS = [
    ("CK Resort", "React, Supabase, PayMongo", "resort booking with role-based portals and PayMongo checkout"),
    ("Taste Trails", "Godot, GDScript", "2D cooking and storytelling game about Bulacan, with saved progress"),
    ("MUSIKA", "React, Vite", "community atlas of classic English-language songs, filed by the band&rsquo;s country"),
    ("ReadThat", "React, Supabase", "book review app with ratings, spoiler flags, reading progress and admin moderation"),
    ("MedEasyna", "PHP, MySQL, Google OAuth", "clinic appointment system with dashboards for five user roles"),
]

# (title, dates, optional one-line description)
EXPERIENCE = [
    (
        "Co-Chapter Organizer, Google Developer Groups on Campus &ndash; NU Baliwag",
        "Jun 2026 &ndash; Present",
        "Co-lead the chapter and its core team; organized InfoSession 2026 and Gem in AI, a hands-on Google "
        "Gemini workshop",
    ),
    ("Executive Secretary, Google Developer Groups on Campus &ndash; NU Baliwag", "Dec 2025 &ndash; May 2026", ""),
    (
        "Batch Delegate (1st &ndash; 3rd Year) and Class Representative (1st Year), NU Literates Community",
        "Aug 2023 &ndash; May 2026",
        "",
    ),
    ("Event Lead, Google Developer Student Clubs &ndash; NU Baliwag", "May 2024 &ndash; Jun 2024", ""),
]

SEMINARS = (
    "GATHER 2025: Google Developers Assembly (Volunteer); Gem in AI: A Gemini Workshop (Volunteer); "
    "InfoSession 2026 (Participant); StuG!: A Flutter and Firebase Workshop, Google Developer Student Clubs "
    "(Participant, 2023)"
)

# ----------------------------------------------------------------- style

INK = HexColor("#111111")
MUTED = HexColor("#4a4a4a")
RULE = HexColor("#9a9a9a")

S = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=17.5, leading=20,
                           alignment=1, textColor=INK, spaceAfter=2),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=7.9, leading=10.5,
                              alignment=1, textColor=MUTED, spaceAfter=7),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=8.8, leading=11,
                              textColor=INK, spaceBefore=0, spaceAfter=0),
    'summary': ParagraphStyle('summary', fontName='Helvetica', fontSize=8.2, leading=10.8,
                              alignment=TA_JUSTIFY, textColor=INK),
    'org': ParagraphStyle('org', fontName='Helvetica-Bold', fontSize=8.7, leading=10.8,
                          textColor=INK),
    'dates': ParagraphStyle('dates', fontName='Helvetica-Oblique', fontSize=8.0, leading=10.6,
                            textColor=MUTED),
    'role': ParagraphStyle('role', fontName='Helvetica-Oblique', fontSize=8.1, leading=10.4,
                           textColor=MUTED),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=8.1, leading=10.5,
                           textColor=INK, alignment=TA_JUSTIFY),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=8.1, leading=10.5,
                             textColor=INK, leftIndent=9, bulletIndent=0, bulletFontName='Helvetica'),
    'skill': ParagraphStyle('skill', fontName='Helvetica', fontSize=8.2, leading=11.0,
                            textColor=INK),
}


class Rule(Flowable):
    """Hairline under a section heading."""

    def __init__(self, width, thickness=0.6, space_before=1.2, space_after=3.2):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.space_after = space_after
        self.height = thickness + space_before + space_after

    def draw(self):
        self.canv.setStrokeColor(RULE)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.space_after, self.width, self.space_after)


def two_col(left, right, width, lstyle, rstyle):
    """Title on the left, dates flush right, on one line."""
    t = Table([[Paragraph(left, lstyle), Paragraph(right, rstyle)]],
              colWidths=[width * 0.735, width * 0.265])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t


def build(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    margin = 0.5 * inch
    doc = BaseDocTemplate(
        path, pagesize=LETTER,
        leftMargin=margin, rightMargin=margin,
        topMargin=0.4 * inch, bottomMargin=0.36 * inch,
        title="Rien Miro M. Gappi - Curriculum Vitae",
        author="Rien Miro M. Gappi",
        subject="Curriculum Vitae",
    )
    W = doc.width
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='body',
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='cv', frames=[frame])])

    story = []

    def section(title, gap=5):
        story.append(Spacer(1, gap))
        story.append(Paragraph(title.upper(), S['section']))
        story.append(Rule(W))

    # --- header
    story.append(Paragraph(NAME, S['name']))
    story.append(Paragraph("&nbsp;&bull;&nbsp; ".join(CONTACT), S['contact']))
    story.append(Paragraph(SUMMARY, S['summary']))

    BUL = '\u2022'

    # --- education
    section("Education")
    for school, where, degree, dates, bullets in EDUCATION:
        story.append(KeepTogether([
            two_col(school, where, W, S['org'], S['dates']),
            two_col(degree, dates, W, S['role'], S['dates']),
        ] + [Paragraph(b, S['bullet'], bulletText=BUL) for b in bullets] + [Spacer(1, 2.6)]))

    # --- skills, high on the page
    section("Technical Skills")
    for label, items in SKILLS:
        story.append(Paragraph("<b>{}:</b> {}".format(label, items), S['skill']))

    # --- projects
    section("Projects")
    for name, stack, dates, bullets in PROJECTS:
        story.append(KeepTogether([
            two_col("{} &nbsp;|&nbsp; <font name='Helvetica-Oblique'>{}</font>".format(name, stack), dates,
                    W, S['org'], S['dates']),
        ] + [Paragraph(b, S['bullet'], bulletText=BUL) for b in bullets] + [Spacer(1, 3)]))

    names = ", ".join(n for n, _, _ in OTHER_PROJECTS)
    story.append(KeepTogether(
        [Paragraph("Other Projects &nbsp;|&nbsp; <font name='Helvetica-Oblique'>{}</font>".format(names), S['org'])]
        + [Paragraph("<b>{}</b> ({}): {}".format(n, st, d), S['bullet'], bulletText=BUL)
           for n, st, d in OTHER_PROJECTS]
    ))

    # --- experience
    section("Leadership &amp; Experience")
    for title, dates, body in EXPERIENCE:
        block = [two_col(title, dates, W, S['org'], S['dates'])]
        if body:
            block.append(Paragraph(body, S['bullet'], bulletText=BUL))
        block.append(Spacer(1, 2.2))
        story.append(KeepTogether(block))

    # --- seminars & workshops
    section("Seminars &amp; Workshops")
    story.append(Paragraph(SEMINARS, S['body']))

    doc.build(story)
    return path


def page_count(path):
    """Cheap page count so the one-page rule is actually enforced."""
    with open(path, 'rb') as f:
        blob = f.read()
    return blob.count(b'/Type /Page') - blob.count(b'/Type /Pages')


if __name__ == '__main__':
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(here, 'public', 'cv', 'Rien-Miro-Gappi-CV.pdf')
    build(out)

    pages = page_count(out)
    size_kb = os.path.getsize(out) // 1024
    print("wrote {}  ({} KB, {} page{})".format(out, size_kb, pages, '' if pages == 1 else 's'))

    if pages != 1:
        print(
            "\n!! The CV is {} pages. It is meant to be one.\n"
            "   Trim a project, a role, or a line of the summary and re-run.".format(pages),
            file=sys.stderr,
        )
        sys.exit(1)

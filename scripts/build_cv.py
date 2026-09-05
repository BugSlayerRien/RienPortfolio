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
]

SUMMARY = (
    "Fourth-year BS Information Technology student who ships full products, not just screens &mdash; "
    "a Flutter barbershop app with a computer-vision haircut recommender, a resort booking platform "
    "with role-separated portals and live payments, a book review app on Supabase. Most at home in "
    "the front end; used to leading a team as well as building for one."
)

# Skills first: it is the section that gets scanned, and keyword-matched.
SKILLS = [
    ("Languages", "JavaScript, Dart, PHP, Python, SQL, HTML5, CSS3"),
    ("Frameworks", "React, Vite, Flutter, React Router"),
    ("Backend &amp; Data", "Supabase, PostgreSQL, MySQL, REST APIs, Row-Level Security"),
    ("AI &amp; Vision", "Google Gemini API, MediaPipe"),
    ("Tools", "Git, GitHub, Vercel, Figma, PayMongo"),
]

# (name, stack, one-line description)
PROJECTS = [
    (
        "Barberya ni Tatis",
        "Flutter, Dart, PHP, MySQL, Python, MediaPipe, Gemini API",
        "Barbershop platform built around an AI face scan: a Python pipeline runs MediaPipe face "
        "detection and mesh to derive face shape and hair attributes, then an LLM ranks the top five "
        "hairstyles with previews. Separate portals for customers, reception, walk-ins, kiosk and admin.",
    ),
    (
        "CK Resort",
        "React, Vite, Supabase, PostgreSQL, PayMongo",
        "Resort booking and operations with a portal per role. Live payments through PayMongo with "
        "proof-of-payment uploads; Postgres row-level security separates what each role can read and write.",
    ),
    (
        "ReadThat",
        "React, Vite, React Router, Supabase, PostgreSQL",
        "Book discovery and review app &mdash; ratings, spoiler flags, helpful votes, reading states, and "
        "an admin dashboard for the catalogue and moderation.",
    ),
    (
        "AskNU &nbsp;&bull;&nbsp; MedEasyna",
        "Flutter, Gemini API &nbsp;&bull;&nbsp; PHP, MySQL, Google OAuth",
        "A Flutter image analyzer built on Google Gemini, and a clinic appointment platform that "
        "replaced a paper booking log.",
    ),
]

# (organisation, role, dates, one-line description)
EXPERIENCE = [
    (
        "Google Developer Groups on Campus &ndash; NU Baliwag",
        "Co-Chapter Organizer",
        "Jun 2026 &ndash; Present",
        "Co-lead the chapter: plan the term&rsquo;s technical events, coordinate the core team, and "
        "represent it to student organizations and faculty. Ran InfoSession 2026 and Gem in AI, a "
        "hands-on Gemini workshop.",
    ),
    (
        "Google Developer Groups on Campus &ndash; NU Baliwag",
        "Executive Secretary",
        "Dec 2025 &ndash; May 2026",
        "Owned chapter documentation, minutes and member records across the year; volunteered on "
        "GATHER 2025: Google Developers Assembly.",
    ),
    (
        "NU Literates Community",
        "Batch Delegate, 2nd &amp; 3rd Year",
        "Jul 2024 &ndash; May 2026",
        "Two consecutive terms representing the batch &mdash; carried student concerns into planning and "
        "relayed decisions back.",
    ),
    (
        "NU Literates Community",
        "Class Representative, 1st Year",
        "Aug 2023 &ndash; May 2024",
        "First elected role; resource speaker for Study Jam: A Midterm Review Session (ITE233).",
    ),
    (
        "Google Developer Student Clubs",
        "Event Lead",
        "May 2024 &ndash; Jun 2024",
        "Led planning and day-of execution for a campus developer event.",
    ),
]

# (school, degree, dates, honours on one line)
EDUCATION = [
    (
        "National University &ndash; Baliwag",
        "BS Information Technology",
        "2023 &ndash; Expected 2027",
        "Dean&rsquo;s Lister &mdash; 1st Year (2 terms), 2nd Year &nbsp;&bull;&nbsp; Outstanding Programming Project",
    ),
    (
        "STI College Baliuag",
        "Senior High School",
        "2021 &ndash; 2023",
        "Graduated With High Honors &nbsp;&bull;&nbsp; Outstanding Student Award",
    ),
]

# Folded into two runs. The detail lives on the portfolio, linked up top.
CERTIFICATIONS = [
    (
        "GDG on Campus &ndash; NU Baliwag",
        "2025&ndash;2026",
        "InfoSession 2026 (Participation) &bull; Gem in AI: A Gemini Workshop (Appreciation, Volunteer) "
        "&bull; Membership, 1st &amp; 2nd Term AY 2025&ndash;2026 &bull; GATHER 2025: Google Developers "
        "Assembly (Appreciation, Volunteer)",
    ),
    (
        "Earlier",
        "2023",
        "StuG! a Flutter and Firebase Workshop, Google Developer Student Clubs (Participation) &bull; "
        "Study Jam: A Midterm Review Session, NU Literates Community (Resource Speaker)",
    ),
]

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

    # --- skills, high on the page
    section("Technical Skills")
    for label, items in SKILLS:
        story.append(Paragraph("<b>{}:</b> {}".format(label, items), S['skill']))

    # --- projects
    section("Projects")
    for name, stack, body in PROJECTS:
        story.append(KeepTogether([
            Paragraph(name, S['org']),
            Paragraph(stack, S['role']),
            Paragraph(body, S['body']),
            Spacer(1, 3.4),
        ]))

    # --- experience
    section("Leadership &amp; Experience")
    for org, role, dates, body in EXPERIENCE:
        story.append(KeepTogether([
            two_col(org, dates, W, S['org'], S['dates']),
            Paragraph(role, S['role']),
            Paragraph(body, S['body']),
            Spacer(1, 3.4),
        ]))

    # --- education
    section("Education")
    for school, degree, dates, honours in EDUCATION:
        story.append(KeepTogether([
            two_col(school, dates, W, S['org'], S['dates']),
            Paragraph("{} &nbsp;&bull;&nbsp; {}".format(degree, honours), S['role']),
            Spacer(1, 3.2),
        ]))

    # --- certifications
    section("Certifications")
    for issuer, when, items in CERTIFICATIONS:
        story.append(KeepTogether([
            two_col(issuer, when, W, S['org'], S['dates']),
            Paragraph(items, S['body']),
            Spacer(1, 3.2),
        ]))

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

import io
import re
from pathlib import Path
from urllib.parse import urlparse

import requests
from pypdf import PdfWriter, PdfReader
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

PDF_URLS = [
    "https://www.prapatti.com/slokas/english/tiruccaalagraamampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruccengunruurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirucceraipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruccingavelkunrampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirucciriivaramangaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruccirupuliyuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruccitrakuudampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirucemponceykoyilpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirudvaarakaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkaaragampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkaarvaanampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkaatkaraipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkaavalampaadipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkaazicciiraamavinnagarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkaccipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkadalmallaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkadigaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkadittaanampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkalvanuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkandampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkandiyuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkannamangaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkannangudipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkannapurampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkarambanuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkavittalampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkoluurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkottiyuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkovaluurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkozipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkudandaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkulandaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkuruguurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkurungudipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkuudalpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirukkuudaluurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirumaalirunjolaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirumanikkuudampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirumanimaadakkoyilpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirumeyyampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirumoguurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirumuuzikkalampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirunaagaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirunaavaaypaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirunaimicaaranyampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirunandipuravinnagarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirunaraiyuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruniiragampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruniirmalaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirunilaattingaltundampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruninravuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirupaartthanpallipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppaadagampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppaarkadalpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirupparamapadampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirupparameccuravinnagarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppavalavannampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirupperaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirupperpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppirudipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppulingudipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppuliyuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppullaanipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruppullambhuutangudipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tirupputkuzipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttalaiccanganaanmadiyampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttanjaimaamanikkoyilpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttankaalpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttankaapaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttetriyambalampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttevanaartogaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruttolaivillimangalampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaadanuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaalitirunagaripaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaaranvilaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaattaarupaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaayppaadipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvadamaduraipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvadariyaashramampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvahiindirapurampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaikundampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaikundavinnagarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvallavaazpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvallikkenipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvanantapurampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvanbilpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvanparisaarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvanpurudottamampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvanvanduurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvaragunamangaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvarangampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvattabhuyakarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvayoddhipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvazunduurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvekkaapaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvellakkulampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvellaraipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvelliyangudipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvelukkaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvengadampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvidavendaipaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvilliputtuurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvindaluurpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvinnagarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruvittuvakkodupaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruyarimeyavinnagarampaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruyevvulpaasurangal.pdf",
    "https://www.prapatti.com/slokas/english/tiruyuuragampaasurangal.pdf",
]

DOWNLOAD_DIR = Path("pdfs")
OUTPUT_FILE = "divya_desam_paasurangal_merged.pdf"

DOWNLOAD_DIR.mkdir(exist_ok=True)


def filename_to_title(filename: str) -> str:
    """Convert a filename like 'tiruccaalagraamampaasurangal.pdf'
    to a readable section title like 'Tiruccaalagraamam'."""
    # Strip suffix and trailing 'paasurangal'
    stem = Path(filename).stem  # e.g. tiruccaalagraamampaasurangal
    title = re.sub(r"paasurangal$", "", stem, flags=re.IGNORECASE).strip()
    # Capitalise first letter
    return title.capitalize()


def make_section_page(title: str, index: int, total: int) -> bytes:
    """Return bytes of a single-page PDF that acts as a section divider."""
    buf = io.BytesIO()
    width, height = A4
    c = canvas.Canvas(buf, pagesize=A4)

    # Light cream background
    c.setFillColorRGB(0.98, 0.96, 0.90)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Decorative top bar
    c.setFillColorRGB(0.55, 0.27, 0.07)   # deep saffron-brown
    c.rect(0, height - 60, width, 60, fill=1, stroke=0)

    # Decorative bottom bar
    c.rect(0, 0, width, 30, fill=1, stroke=0)

    # Section number badge
    c.setFillColorRGB(0.82, 0.41, 0.12)
    c.circle(width / 2, height / 2 + 80, 48, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 26)
    num_text = str(index)
    c.drawCentredString(width / 2, height / 2 + 70, num_text)

    # Main title
    c.setFillColorRGB(0.25, 0.12, 0.03)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height / 2, title)

    # Subtitle line
    c.setFont("Helvetica", 14)
    c.setFillColorRGB(0.45, 0.22, 0.05)
    c.drawCentredString(width / 2, height / 2 - 36, "Paasurangal")

    # Progress indicator
    c.setFont("Helvetica", 11)
    c.setFillColorRGB(0.55, 0.27, 0.07)
    c.drawCentredString(width / 2, height / 2 - 80, f"{index} of {total}")

    # Top bar label
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 38, "Divya Desam")

    c.save()
    buf.seek(0)
    return buf.read()


# ── Download ──────────────────────────────────────────────────────────────────

pdf_files = []

for i, url in enumerate(PDF_URLS, start=1):
    filename = Path(urlparse(url).path).name
    filepath = DOWNLOAD_DIR / filename

    if not filepath.exists():
        print(f"[{i}/{len(PDF_URLS)}] Downloading {filename}")
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        filepath.write_bytes(response.content)
    else:
        print(f"[{i}/{len(PDF_URLS)}] Already exists: {filename}")

    pdf_files.append(filepath)

# ── Merge with section dividers ───────────────────────────────────────────────

print("\nMerging PDFs with section pages...")

writer = PdfWriter()
total = len(pdf_files)

for idx, pdf in enumerate(pdf_files, start=1):
    title = filename_to_title(pdf.name)

    # --- Insert section divider page ---
    section_bytes = make_section_page(title, idx, total)
    section_reader = PdfReader(io.BytesIO(section_bytes))
    writer.add_page(section_reader.pages[0])

    # --- Add outline / bookmark for this section ---
    # page_count before appending content pages
    divider_page_index = len(writer.pages) - 1
    writer.add_outline_item(title, divider_page_index)

    # --- Append actual content pages ---
    try:
        writer.append(str(pdf))
        print(f"[{idx}/{total}] Added: {pdf.name}")
    except Exception as e:
        print(f"[{idx}/{total}] Failed: {pdf.name} -> {e}")

with open(OUTPUT_FILE, "wb") as f:
    writer.write(f)

writer.close()

print(f"\nDone! Output: {OUTPUT_FILE}")
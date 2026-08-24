import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("file:///app/index.html")
        await page.wait_for_selector(".app-container")

        # Check speech tip button
        btn_tip = page.locator("#btn-speak-tip")
        await btn_tip.wait_for(state="visible")
        print("Speech tip button is visible.")

        # Re-query buttons inside loop
        for _ in range(3):
            btn = await page.query_selector('#keyword-list-body button:not(.btn-outline-danger)')
            if btn:
                await btn.click()
                await page.wait_for_timeout(200)

        await page.click('#btn-submit-stage1')
        await page.wait_for_selector('#modal-overlay:not(.hidden)')

        # Take screenshot of modal with voice button
        screenshot_path = "/tmp/verify_voice_modal.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())

'use strict'

const { Builder, By, Select, until } = require('selenium-webdriver');

const { 
  ROOT_URL,
  LOGIN_PAGE_TITLE,
  EMAIL,
  PASSWORD,
  LEAVE_ERROR_MESSAGE,
  LEAVE_DATE
} = require('./constants/testData');

let driver = new Builder().forBrowser('chrome').build()
// driver.manage().window().maximize()
let leaveId

const path = require('path')
const attachment1 = path.relative(process.cwd(), __dirname) + '/../resources/attachment1.png'
const attachment2 = path.relative(process.cwd(), __dirname) + '/../resources/attachment2.png'

describe('Add New Leave', () => {

  test('Visit login page', async () => {
    await driver.get(`${ROOT_URL}`)
    const title = await driver.getTitle()
    expect(LOGIN_PAGE_TITLE).toBe(title)

    new Promise(resolve => setTimeout(resolve, 2000))
  })

  test('Check login form input', async () => {
    const emailInput = await driver.findElement(By.name('email'))
    const emailInputIsVisible = await emailInput.isDisplayed()
    expect(emailInputIsVisible).toBeTruthy()
    
    emailInput.sendKeys(EMAIL)

    const passwordInput = await driver.findElement(By.name('password'))
    const passwordInputIsVisible = await passwordInput.isDisplayed()
    expect(passwordInputIsVisible).toBeTruthy()

    passwordInput.sendKeys(PASSWORD)

    const loginButton = await driver.findElement(By.css('button[type="submit"]'))
    const loginButtonIsVisible = await loginButton.isDisplayed()
    expect(loginButtonIsVisible).toBeTruthy()

    loginButton.click()
  })

  test('Visit list leave page', async () => {
    await driver.get(`${ROOT_URL}/#/Leave`)
    const getCurrentUrl = await driver.getCurrentUrl()
    expect(`${ROOT_URL}/#/Leave`).toBe(getCurrentUrl)
  })

  test('Go to add new leave page', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const addNewLeaveButton = await driver.findElement(By.css('.add-new'))
    addNewLeaveButton.click()

    await new Promise(resolve => setTimeout(resolve, 2000));

    const getCurrentUrl = await driver.getCurrentUrl()
    expect(`${ROOT_URL}/#/LeaveDetails`).toBe(getCurrentUrl)
  }, 10000)

  test('Check form validation for required fields', async () => {
    const saveButton = await driver.findElement( By.css('form > .mb-3 button'))
    saveButton.click()

    await new Promise(resolve => setTimeout(resolve, 2000));
    const errorElements = await driver.findElements(By.css('.Toastify__toast.Toastify__toast-theme--colored.Toastify__toast--error > .Toastify__toast-body > div'))

    // Error message capture and assertion
      const errorMessage = await errorElements[1].getAttribute('textContent')
      expect(LEAVE_ERROR_MESSAGE).toBe(errorMessage)
  })

  test('Fill form with valid data', async () => {
    // Select Employee
    const employeeSelect = await driver.findElement(By.name('employee_id'))
    const select = new Select(employeeSelect)
    select.selectByVisibleText('mariam ')

    const fromDateInput = await driver.findElement(By.name('from_date'))
    fromDateInput.sendKeys(LEAVE_DATE)

    const toDateInput = await driver.findElement(By.name('to_date'))
    toDateInput.sendKeys(LEAVE_DATE)

    const leaveTypeSelect = await driver.findElement(By.name('leave_type'))
    const select2 = new Select(leaveTypeSelect)
    select2.selectByVisibleText('Sick Leave')

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const saveButton = await driver.findElement( By.css('form > .mb-3 button'))
    saveButton.click()

  })

  test('Modify leave and Save', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const status = await driver.findElement(By.name('status'))
    const select = new Select(status)
    select.selectByValue('Approved')

    const no_of_days = await driver.findElement(By.name('no_of_days'))
    no_of_days.sendKeys('1')

    // // check the value of no_of_days
    // const no_of_days_value = await no_of_days.getAttribute('value')
    // expect('1').toBe(no_of_days_value)
    //
    const allButtons = await driver.findElements(By.css('form >  .mb-3 button'))

    await new Promise(resolve => setTimeout(resolve, 2000));
    // Apply modification
    allButtons[1].click()

    const pageUrl = await driver.getCurrentUrl()
    const match = pageUrl.match(/\/LeavesEdit\/(\d+)/);

    leaveId = match ? match[1] : null; 

    // Save modification
    allButtons[0].click()
  })

})

describe('List Leave and Edit Leave', () => {
  test('Visit list leave page', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await driver.get(`${ROOT_URL}/#/Leave`)
    const getCurrentUrl = await driver.getCurrentUrl()
    expect(`${ROOT_URL}/#/Leave`).toBe(getCurrentUrl)
  })

  test('Check leave list pagination', async () => {
    const nextPge = await driver.findElement( By.css('.paginate_button.next'))
    nextPge.click()
    await new Promise(resolve => setTimeout(resolve, 2000));
  })

  test('Go to edit leave page', async () => {
    const leaveEditPageUrl = `${ROOT_URL}/#/LeavesEdit/${leaveId}?tab=1`

    await driver.get(leaveEditPageUrl)
    const getCurrentUrl = await driver.getCurrentUrl()
    expect(leaveEditPageUrl).toBe(getCurrentUrl)
  })

  test('Attach file', async () => {
    const fileTabInput = await driver.findElement( By.css('.tab-content button'))
    fileTabInput.click()

    await new Promise(resolve => setTimeout(resolve, 1000));
    const fileInput = await driver.findElement( By.css('input[type="file"]'))
    let file1 = path.resolve(attachment1)
    fileInput.sendKeys(file1)

    const uploadButton = await driver.findElements( By.css( '.modal-footer button'))
    uploadButton[0].click()
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    fileTabInput.click()
    await new Promise(resolve => setTimeout(resolve, 2000));

    let file2 = path.resolve(attachment2)
    await driver.findElement( By.css('input[type="file"]')).sendKeys(file2)
    await driver.findElement( By.css('.modal-footer button')).click()

  }, 10000)

})

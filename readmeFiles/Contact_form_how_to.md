# Contact Form Setup

The contact page (`kontakt.html`) uses a fully functional form powered by **Web3Forms** -- a free, serverless form submission service. No backend or server-side code is needed.

## How It Works

When a visitor fills out the form and clicks **Odeslat data**, the browser sends a POST request directly to `https://api.web3forms.com/submit`. Web3Forms then forwards the message to the email address linked to the access key.

### Form Fields

| Field   | HTML `name` | Required | Description                        |
|---------|-------------|----------|------------------------------------|
| Jmeno   | `name`      | Yes      | Visitor's full name                |
| Email   | `email`     | Yes      | Visitor's email address            |
| Zprava  | `message`   | Yes      | Free-text message body             |

### Hidden Fields

These are invisible to the visitor but control how Web3Forms handles the submission:

| Field         | Value                                          | Purpose                                       |
|---------------|------------------------------------------------|-----------------------------------------------|
| `access_key`  | `9bad58c9-b494-4af4-a17d-a75e5ef37f5a`         | Links form to your Web3Forms account           |
| `subject`     | `Nova zprava z RECPIC webu`                    | Email subject line for incoming messages       |
| `redirect`    | *(your site URL + `/kontakt.html`)*            | Page the visitor is sent back to after submit  |

## Setup Checklist

### 1. Update the Redirect URL
The `redirect` hidden field must point to your **live production URL**, not localhost. Open `kontakt.html` and find this line:

```html
<input type="hidden" name="redirect" value="http://127.0.0.1:8090/kontakt.html">
```

Change it to your production domain, for example:

```html
<input type="hidden" name="redirect" value="https://www.recpic.cz/kontakt.html">
```

### 2. Verify the Access Key
The access key is already set. If you ever need to regenerate it or link a different email:
1. Go to [https://web3forms.com](https://web3forms.com)
2. Enter the email address where you want to receive form submissions
3. You will receive a new access key via email
4. Replace the `access_key` value in `kontakt.html`

### 3. Test the Form
After deploying, submit a test message through the live form and confirm the email arrives at the linked inbox.

## Page Layout

The contact page uses a two-column HUD-style layout:

- **Left column** -- Company info (address, ICO/DIC, phone, email)
- **Right column** -- The contact form with a running timecode counter

On screens narrower than 900px, the layout collapses to a single column.

## Buttons

- **Zpet** -- navigates back to `index.html`
- **Odeslat data** -- submits the form

Both buttons share the same `.btn-submit` style with a red hover fill animation. The back button is an `<a>` tag styled as a button via the `.btn-back` class.

## Customization

- **Email subject line** -- change the `subject` hidden field value
- **Form styling** -- all styles are scoped inside `kontakt.html` in the `<style>` block (CSS variables defined in `:root`)
- **Adding fields** -- add a new `<div class="form-group">` block with a label and input. Web3Forms will automatically include any named field in the email

> [!TIP]
> Web3Forms free tier allows up to 250 submissions per month. For higher volume, upgrade at [web3forms.com/#pricing](https://web3forms.com/#pricing).

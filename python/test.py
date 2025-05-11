from google import genai

client = genai.Client(api_key="AIzaSyAE0wpg7R5RRdKbvzHoLomJ9XvPlhD-9H0")

response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Explain how AI works in a few words"
)
print(response.text)


# http://127.0.0.1:8000/generate_blog_from_audio
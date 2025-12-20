"""
Service to integrate with Pollinations.ai API for text generation.
Replaces local T5 model for faster, cloud-based generation.
"""

import requests
from typing import Optional


POLLINATIONS_TEXT_API = "https://text.pollinations.ai/"


def generate_recommendation_via_pollinations(
    user_query: str,
    context: str,
    model: str = "openai-large",
    timeout: int = 30,
) -> str:
    """
    Generate a fashion recommendation using Pollinations.ai text API.
    
    Args:
        user_query: The user's search query
        context: Retrieved product information
        model: The model to use (e.g., 'openai-large', 'openai-medium')
        timeout: Request timeout in seconds
    
    Returns:
        Generated recommendation text (single line)
    """
    
    # Build a smart prompt for fashion recommendation
    prompt = (
        "You are a fashion stylist. Based on the user's search query and the relevant "
        "products found, write ONE concise single-line recommendation in English. "
        "Describe what the product is, why it matches the query, and key features. "
        "Do NOT include labels (Name:, Composition:, etc.), product names, or extra text. "
        "Example query: 'red hat' -> Output: 'Red baseball cap with adjustable strap and curved visor'.\n\n"
        f"User search: {user_query}\n\n"
        f"Matching products:\n{context}\n\n"
        "Recommendation:"
    )
    
    try:
        # Use POST method for more control
        payload = {
            "prompt": prompt,
            "model": model,
            "seed": 42,  # For consistency
            "temperature": 0.7,
            "max_tokens": 50,
        }
        
        response = requests.post(
            POLLINATIONS_TEXT_API,
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()
        
        # Parse response - Pollinations returns text directly or in JSON
        if response.headers.get("content-type", "").startswith("application/json"):
            data = response.json()
            text = data.get("response") or data.get("text") or str(data)
        else:
            text = response.text
        
        # Clean up the response
        text = text.strip()
        
        # Remove common unwanted prefixes
        import re
        cleaned = re.sub(
            r"^\s*(Recommendation:?\s*|Output:?\s*|Composition:?\s*|Name:?\s*)",
            "",
            text,
            flags=re.IGNORECASE
        ).strip()
        
        # Remove extra symbols at start
        cleaned = re.sub(r"^[\s\-\*\.]+", "", cleaned).strip()
        
        if cleaned and len(cleaned) > 5:
            return cleaned
        
        return text if text else "Recommendation available"
        
    except requests.exceptions.Timeout:
        return f"Fashion recommendation for your '{user_query}' search (API timeout)"
    except requests.exceptions.RequestException as e:
        print(f"[pollinations_service] Error: {e}")
        return f"Perfect match for your '{user_query}' search"
    except Exception as e:
        print(f"[pollinations_service] Unexpected error: {e}")
        return f"Recommended fashion item for '{user_query}'"

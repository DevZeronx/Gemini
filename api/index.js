// Node.js এর বিল্ট-ইন crypto মডিউল ইম্পোর্ট করা হচ্ছে SHA256 হ্যাশ তৈরির জন্য
import { createHash } from 'crypto';

// মূল সার্ভারবিহীন ফাংশন
export default async function handler(request, response) {
    // URL থেকে 'text' প্যারামিটার নেওয়া হচ্ছে (PHP-তে $_GET['text'] এর মতো)
    const text = request.query.text;

    // 'text' প্যারামিটার না থাকলে এরর মেসেজ পাঠানো হচ্ছে
    if (!text || text.trim() === '') {
        // HTTP 400 Bad Request স্ট্যাটাস এবং JSON এরর মেসেজ পাঠানো হচ্ছে
        return response.status(400).json({ error: "Missing 'text' parameter" });
    }

    const trimmedText = text.trim();

    // এক্সটার্নাল API-এর URL
    const apiUrl = "https://chat2.free2gpt.com/api/generate";

    // টাইমস্ট্যাম্প তৈরি করা হচ্ছে (মিলিসেকেন্ডে)
    const timestamp = Date.now();

    // SHA256 সিগনেচার তৈরির ফাংশন
    const generateSignature = (time, text, secret = "") => {
        const message = `${time}:${text}:${secret}`;
        return createHash('sha256').update(message).digest('hex');
    };

    // সিগনেচার তৈরি করা হচ্ছে
    const sign = generateSignature(timestamp, trimmedText);

    // এক্সটার্নাল API-তে পাঠানোর জন্য পেলোড (payload) তৈরি করা হচ্ছে
    const payload = {
        messages: [{ role: "user", content: trimmedText }],
        time: timestamp,
        pass: null,
        sign: sign,
    };

    try {
        // fetch ব্যবহার করে POST রিকোয়েস্ট পাঠানো হচ্ছে (PHP-তে cURL এর মতো)
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://chat2.free2gpt.com',
                'Referer': 'https://chat2.free2gpt.com',
            },
            body: JSON.stringify(payload), // ডেটাকে JSON স্ট্রিং-এ রূপান্তর করা হচ্ছে
        });

        // এক্সটার্নাল API থেকে পাওয়া রেসপন্সকে JSON হিসেবে পড়া হচ্ছে
        const responseData = await apiResponse.json();

        // সফল হলে, মূল ব্যবহারকারীকে সেই ডেটা পাঠানো হচ্ছে
        response.status(200).json(responseData);

    } catch (error) {
        // কোনো নেটওয়ার্ক বা অন্য এরর হলে তা জানানো হচ্ছে
        response.status(500).json({ error: 'Failed to fetch from the external API.', details: error.message });
    }
}

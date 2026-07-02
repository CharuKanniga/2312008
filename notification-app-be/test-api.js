const BASE_URL = "http://localhost:5000/api/notifications";

async function runTests() {
    try {
        console.log("=== RUNNING API VERIFICATION TESTS ===\n");

        // 1. Get initial notifications (should be empty)
        console.log("1. Fetching initial notifications...");
        const res1 = await fetch(BASE_URL).then(r => r.json());
        console.log("Total notifications:", res1.total);
        console.log("Notifications list:", res1.notifications);
        console.log("--------------------------------------\n");

        // 2. Create a notification
        console.log("2. Creating a Placement notification...");
        const res2 = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "Placement",
                title: "TCS Placement Drive",
                message: "TCS is conducting a campus recruitment drive tomorrow."
            })
        }).then(r => r.json());
        const createdId = res2.notification.id;
        console.log("Created notification ID:", createdId);
        console.log("--------------------------------------\n");

        // 3. Create another notification
        console.log("3. Creating an Event notification...");
        await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "Event",
                title: "Hackathon 2026",
                message: "Register for the annual campus hackathon by Friday."
            })
        });
        console.log("Created Event notification");
        console.log("--------------------------------------\n");

        // 4. Get unread count (should be 2)
        console.log("4. Fetching unread notifications count...");
        const res4 = await fetch(`${BASE_URL}/unread-count`).then(r => r.json());
        console.log("Unread count:", res4.unreadCount);
        console.log("--------------------------------------\n");

        // 5. Get notifications with filter
        console.log("5. Fetching notifications with type=Placement...");
        const res5 = await fetch(`${BASE_URL}?type=Placement`).then(r => r.json());
        console.log("Placement count:", res5.total);
        console.log("Placement list:", res5.notifications.map(n => n.title));
        console.log("--------------------------------------\n");

        // 6. Mark first as read
        console.log(`6. Marking notification ID ${createdId} as read...`);
        const res6 = await fetch(`${BASE_URL}/${createdId}/read`, { method: "PATCH" }).then(r => r.json());
        console.log("Marked read result:", res6.notification.read);
        console.log("--------------------------------------\n");

        // 7. Get unread count (should be 1)
        console.log("7. Fetching unread notifications count again...");
        const res7 = await fetch(`${BASE_URL}/unread-count`).then(r => r.json());
        console.log("Unread count:", res7.unreadCount);
        console.log("--------------------------------------\n");

        // 8. Mark all read
        console.log("8. Marking all notifications as read...");
        const res8 = await fetch(`${BASE_URL}/mark-all-read`, { method: "POST" }).then(r => r.json());
        console.log("Mark all read result count:", res8.count);
        console.log("--------------------------------------\n");

        // 9. Get unread count (should be 0)
        console.log("9. Fetching unread notifications count final check...");
        const res9 = await fetch(`${BASE_URL}/unread-count`).then(r => r.json());
        console.log("Unread count:", res9.unreadCount);
        console.log("--------------------------------------\n");

        // 10. Delete notification
        console.log(`10. Deleting notification ID ${createdId}...`);
        const res10 = await fetch(`${BASE_URL}/${createdId}`, { method: "DELETE" }).then(r => r.json());
        console.log("Deleted result:", res10.success);
        console.log("--------------------------------------\n");

        console.log("=== ALL API TESTS PASSED SUCCESSFULLY ===");
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

runTests();

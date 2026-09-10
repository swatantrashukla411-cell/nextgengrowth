#include <iostream>
using namespace std;

class Node {
public:
    int data;
    Node* prev;
    Node* next;

    Node(int value) {
        data = value;
        prev = NULL;
        next = NULL;
    }
};

int main() {

    // Creating 3 nodes
    Node* node1 = new Node(10);
    Node* node2 = new Node(20);
    Node* node3 = new Node(30);

    // Linking node1 and node2
    node1->next = node2;
    node2->prev = node1;

    // Linking node2 and node3
    node2->next = node3;
    node3->prev = node2;

    // Head points to first node
    Node* head = node1;

    // Printing the doubly linked list
    Node* temp = head;

    while (temp != NULL) {
        cout << temp->data << " ";
        temp = temp->next;
    }

    return 0;
}
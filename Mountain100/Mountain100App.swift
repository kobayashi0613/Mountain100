import SwiftUI

@main
struct Mountain100App: App {
    @State private var store = MountainStore()

    var body: some Scene {
        WindowGroup {
            MountainListView()
                .environment(store)
        }
    }
}

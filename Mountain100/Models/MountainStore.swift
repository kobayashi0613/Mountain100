import Foundation
import Observation

/// 百名山データの読み込みと登頂記録の永続化を担うストア
@Observable
final class MountainStore {
    /// 掲載順（北→南）の百名山一覧
    private(set) var mountains: [Mountain] = []

    /// 登頂済みの山の id 集合
    private(set) var visitedIDs: Set<Int> = []

    private static let visitedKey = "visitedMountainIDs"
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        loadMountains()
        loadVisited()
    }

    // MARK: - 登頂記録

    var visitedCount: Int {
        visitedIDs.count
    }

    func isVisited(_ mountain: Mountain) -> Bool {
        visitedIDs.contains(mountain.id)
    }

    func setVisited(_ mountain: Mountain, _ visited: Bool) {
        if visited {
            visitedIDs.insert(mountain.id)
        } else {
            visitedIDs.remove(mountain.id)
        }
        saveVisited()
    }

    func toggleVisited(_ mountain: Mountain) {
        setVisited(mountain, !isVisited(mountain))
    }

    // MARK: - 永続化

    private func loadVisited() {
        let saved = defaults.array(forKey: Self.visitedKey) as? [Int] ?? []
        visitedIDs = Set(saved)
    }

    private func saveVisited() {
        defaults.set(Array(visitedIDs).sorted(), forKey: Self.visitedKey)
    }

    // MARK: - データ読み込み

    private func loadMountains() {
        guard let url = Bundle.main.url(forResource: "mountain100", withExtension: "json") else {
            assertionFailure("mountain100.json がバンドルに見つかりません")
            return
        }
        do {
            let data = try Data(contentsOf: url)
            let dataset = try JSONDecoder().decode(MountainDataset.self, from: data)
            mountains = dataset.mountains.sorted { $0.id < $1.id }
        } catch {
            assertionFailure("mountain100.json の読み込みに失敗: \(error)")
        }
    }
}
